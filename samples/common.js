// Auto-detect source file based on HTML filename
const currentPage = window.location.pathname.split('/').pop().replace('.html', '.js')

// Load and display source code
fetch(currentPage)
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

// Navigation dropdown toggle
const navToggle = document.getElementById('nav-toggle')
const navMenu = document.getElementById('nav-menu')

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

// Export button handler with custom filenames
document.getElementById('export-btn').addEventListener('click', () => {
  // Get page title and convert to filename-safe format
  const pageTitle = document.title.split('/')[0].trim() // Take first part before '/'
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
