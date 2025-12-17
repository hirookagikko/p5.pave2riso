/**
 * Common JavaScript for p5.pave2riso example pages
 * Handles navigation, code display, export functionality, and plates preview
 */

// Riso ink color mapping for plate labels
const RISO_COLORS = {
  'red': '#FF665E',
  'blue': '#0078BF',
  'yellow': '#FFE800',
  'green': '#00A95C',
  'orange': '#FF6C2F',
  'pink': '#FF48B0',
  'black': '#333333',
  'burgundy': '#914E72',
  'fluorescent pink': '#FF48B0',
  'fluorescentpink': '#FF48B0',
  'teal': '#00838A',
  'hunter green': '#407060',
  'navy': '#003366',
  'aqua': '#5EC8E5',
  'bright red': '#F15060',
  'risofederal blue': '#3D5588',
  'purple': '#765BA7',
  'violet': '#9D7AD2',
  'coral': '#FF7477',
  'gold': '#AC936E',
  'flat gold': '#BB8B41',
  'copper': '#BD6439',
  'brown': '#925F52',
  'light gray': '#888888',
  'medium blue': '#3255A4',
  'bright olive green': '#B49F29',
  'light teal': '#009DA5',
  'fluorescent orange': '#FF7477',
  'fluorescentorange': '#FF7477',
  'crimson': '#E45D50',
  'marine red': '#D2515E',
  'grape': '#6C5D80',
  'bubblegum': '#F984CA',
  'light mauve': '#E6B5C9',
  'lagoon': '#2F6165',
  'sunflower': '#FFB511',
  'apricot': '#F6A04D',
  'paprika': '#EE7F4B',
  'pumpkin': '#FF6F4C',
  'bright gold': '#E5B01D',
  'mint': '#82D8D5',
  'fluorescent yellow': '#FFE916',
  'fluorescentyellow': '#FFE916',
  'fluorescent red': '#FF4C65',
  'fluorescentred': '#FF4C65',
  'fluorescent green': '#44D62C',
  'fluorescentgreen': '#44D62C',
  'lake': '#235BA8',
  'indigo': '#484D7A',
  'midnight': '#435060',
  'mist': '#D5E4C0',
  'granite': '#A5AAA8',
  'charcoal': '#70747C',
  'smoky teal': '#5F8289',
  'steel': '#375E77',
  'slate': '#5E695E',
  'turquoise': '#00AA93',
  'emerald': '#19975D',
  'grass': '#397E58',
  'forest': '#516E5A',
  'spruce': '#4A635D',
  'moss': '#68724D',
  'sea blue': '#0074A2',
  'melon': '#FFAE3B',
  'maroon': '#9E4C6E',
  'wine': '#914E72',
  'gray': '#928D88',
  'ivory': '#FFFEF4',
  'cream': '#FFF5D7',
  'white': '#FFFFFF'
}

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

// Plates preview - shows individual channel separation
function updatePlatesPreview() {
  const container = document.getElementById('plates-preview')
  if (!container || !window.risoChannels) return

  // Clear existing previews
  container.innerHTML = ''

  window.risoChannels.forEach(ch => {
    const card = document.createElement('div')
    card.className = 'plate-card'

    // Channel name label with color dot
    const label = document.createElement('span')
    label.className = 'plate-label'
    const colorName = ch.channelName.toLowerCase()
    label.style.setProperty('--plate-color', RISO_COLORS[colorName] || '#888')
    label.textContent = ch.channelName

    // Create canvas copy (grayscale via CSS filter)
    const preview = document.createElement('canvas')
    const ctx = preview.getContext('2d')
    preview.width = ch.width
    preview.height = ch.height
    ctx.drawImage(ch.canvas, 0, 0)

    card.appendChild(label)
    card.appendChild(preview)
    container.appendChild(card)
  })
}

// Export for global access
window.updatePlatesPreview = updatePlatesPreview

// Export for use in other scripts if needed
window.p5Pave2RisoExamples = {
  EXAMPLES,
  currentPage,
  generateNavMenu,
  updatePlatesPreview
}
