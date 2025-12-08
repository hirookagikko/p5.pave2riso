/**
 * Common JavaScript for p5.pave2riso example pages
 * Handles navigation, code display, and export functionality
 */

// Example navigation structure
const EXAMPLES = [
  { path: 'getting-started.html', title: 'Getting Started' },
  { path: 'fill-types.html', title: 'Fill Types' },
  { path: 'stroke-types.html', title: 'Stroke Types' },
  { path: 'print-modes.html', title: 'Print Modes' },
  { path: 'effects.html', title: 'Effects' },
  { path: 'text-paths.html', title: 'Text Paths' }
]

// Auto-detect source file based on HTML filename
const currentPage = window.location.pathname.split('/').pop()
const currentPageJs = currentPage.replace('.html', '.js')

// Load and display source code
fetch(currentPageJs)
  .then(response => response.text())
  .then(code => {
    // Highlight both single-line and multi-line comments
    let highlighted = code
    // First, highlight multi-line comments /* ... */
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
    // Then, highlight single-line comments //
    highlighted = highlighted.replace(/(^|\s)(\/\/.+)$/gm, '$1<span class="comment">$2</span>')
    document.getElementById('source-code').innerHTML = highlighted
  })
  .catch(error => {
    console.error('Failed to load source code:', error)
    document.getElementById('source-code').textContent = '// Source code not available'
  })

// Navigation dropdown toggle
const navToggle = document.getElementById('nav-toggle')
const navMenu = document.getElementById('nav-menu')

if (navToggle && navMenu) {
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    navMenu.classList.toggle('open')
  })

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    navMenu.classList.remove('open')
  })

  // Prevent closing when clicking inside menu
  navMenu.addEventListener('click', (e) => {
    e.stopPropagation()
  })

  // Mark current page as active
  const links = navMenu.querySelectorAll('a')
  links.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active')
    }
  })
}

// Export button handler with custom filenames
const exportBtn = document.getElementById('export-btn')
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    // Get page title and convert to filename-safe format
    const pageTitle = document.title.split('|')[0].trim() // Take first part before '|'
    const baseName = pageTitle
      .toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')  // Remove non-alphanumeric chars except hyphens

    // Export each channel with custom filename
    if (window.risoChannels && window.risoChannels.length > 0) {
      window.risoChannels.forEach((ch) => {
        const colorName = ch.channelName || ch.channelIndex
        ch.export(`${baseName}-${colorName}.png`)
      })
      console.log(`Exported as ${baseName}-[color].png`)
    } else {
      console.error('Riso channels not found. Make sure setup() has run.')
    }
  })
}

// Utility: Generate navigation menu HTML (for dynamic insertion if needed)
function generateNavMenu() {
  return EXAMPLES.map(example => {
    const isActive = example.path === currentPage ? ' class="active"' : ''
    return `<li><a href="${example.path}"${isActive}>${example.title}</a></li>`
  }).join('\n')
}

// Export for use in other scripts if needed
window.p5Pave2RisoExamples = {
  EXAMPLES,
  currentPage,
  generateNavMenu
}
