// Auto-detect source file based on HTML filename
const currentPage = window.location.pathname.split('/').pop().replace('.html', '.js')

// Load and display source code
fetch(currentPage)
  .then(response => response.text())
  .then(code => {
    const highlighted = code.replace(/^(\s*)\/\/(.+)$/gm, '$1<span class="comment">//$2</span>')
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
