/**
 * User registration form customization
 * Fixes email field, adds validation, and provides better user experience
 */

// Function to fix registration form
function fixRegistrationForm() {
  // Check if we're on the registration page
  if (
    !window.location.pathname.includes('/admin/auth/register') ||
    window.location.pathname.includes('register-admin')
  ) {
    return
  }

  // Wait for the form to be rendered
  const interval = setInterval(() => {
    const form =
      document.querySelector('form[data-testid="login-form"]') ||
      document.querySelector('form[role="presentation"]') ||
      document.querySelector('form')

    if (form && !document.querySelector('#nodewave-form-enhanced')) {
      enhanceRegistrationForm(form)
      clearInterval(interval)
    }
  }, 500)

  // Clear interval after 15 seconds
  setTimeout(() => clearInterval(interval), 15000)
}

// Function to enhance the registration form
function enhanceRegistrationForm(form) {
  console.log('✅ Enhancing registration form...')

  // Add a marker to prevent multiple enhancements
  const marker = document.createElement('div')
  marker.id = 'nodewave-form-enhanced'
  marker.style.display = 'none'
  form.appendChild(marker)

  // Fix email field - remove disabled attribute and add proper attributes
  const emailInput =
    form.querySelector('input[type="email"]') ||
    form.querySelector('input[name="email"]') ||
    form.querySelector('input[placeholder*="email" i]')

  if (emailInput) {
    console.log('📧 Fixing email input field...')
    emailInput.disabled = false
    emailInput.readOnly = false
    emailInput.required = true
    emailInput.setAttribute('type', 'email')
    emailInput.setAttribute('autoComplete', 'email')
    emailInput.style.backgroundColor = '#ffffff'
    emailInput.style.opacity = '1'
    emailInput.style.cursor = 'text'

    // Remove any disabled styling
    emailInput.classList.remove('disabled')

    // Add validation
    emailInput.addEventListener('blur', validateEmail)
  }

  // Find and enhance other form fields
  const usernameInput =
    form.querySelector('input[name="username"]') ||
    form.querySelector('input[placeholder*="username" i]')

  const passwordInput =
    form.querySelector('input[type="password"]') || form.querySelector('input[name="password"]')

  if (usernameInput) {
    usernameInput.required = true
    usernameInput.addEventListener('blur', validateUsername)
  }

  if (passwordInput) {
    passwordInput.required = true
    passwordInput.addEventListener('blur', validatePassword)
  }

  // Add custom styling for better UX
  addFormStyles()

  // Add form submission handler for better error handling
  form.addEventListener('submit', handleFormSubmission)

  console.log('✅ Registration form enhanced successfully')
}

// Email validation function
function validateEmail(event) {
  const input = event.target
  const email = input.value.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  removeFieldError(input)

  if (!email) {
    showFieldError(input, 'Email is required')
    return false
  }

  if (!emailRegex.test(email)) {
    showFieldError(input, 'Please enter a valid email address')
    return false
  }

  showFieldSuccess(input)
  return true
}

// Username validation function
function validateUsername(event) {
  const input = event.target
  const username = input.value.trim()

  removeFieldError(input)

  if (!username) {
    showFieldError(input, 'Username is required')
    return false
  }

  if (username.length < 3) {
    showFieldError(input, 'Username must be at least 3 characters long')
    return false
  }

  showFieldSuccess(input)
  return true
}

// Password validation function
function validatePassword(event) {
  const input = event.target
  const password = input.value

  removeFieldError(input)

  if (!password) {
    showFieldError(input, 'Password is required')
    return false
  }

  if (password.length < 6) {
    showFieldError(input, 'Password must be at least 6 characters long')
    return false
  }

  showFieldSuccess(input)
  return true
}

// Show field error
function showFieldError(input, message) {
  const container = input.closest('div') || input.parentElement
  let errorElement = container.querySelector('.field-error')

  if (!errorElement) {
    errorElement = document.createElement('div')
    errorElement.className = 'field-error'
    container.appendChild(errorElement)
  }

  errorElement.textContent = message
  errorElement.style.color = '#d9534f'
  errorElement.style.fontSize = '12px'
  errorElement.style.marginTop = '4px'

  input.style.borderColor = '#d9534f'
}

// Show field success
function showFieldSuccess(input) {
  input.style.borderColor = '#5cb85c'
}

// Remove field error
function removeFieldError(input) {
  const container = input.closest('div') || input.parentElement
  const errorElement = container.querySelector('.field-error')

  if (errorElement) {
    errorElement.remove()
  }

  input.style.borderColor = ''
}

// Handle form submission
function handleFormSubmission(event) {
  console.log('📝 Processing registration form submission...')

  const form = event.target
  const emailInput = form.querySelector('input[type="email"], input[name="email"]')
  const usernameInput = form.querySelector('input[name="username"]')
  const passwordInput = form.querySelector('input[type="password"]')

  let isValid = true

  // Validate all fields
  if (emailInput && !validateEmail({ target: emailInput })) {
    isValid = false
  }

  if (usernameInput && !validateUsername({ target: usernameInput })) {
    isValid = false
  }

  if (passwordInput && !validatePassword({ target: passwordInput })) {
    isValid = false
  }

  if (!isValid) {
    event.preventDefault()
    console.log('❌ Form validation failed')
    return false
  }

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]')
  if (submitButton) {
    const originalText = submitButton.textContent
    submitButton.textContent = 'Creating Account...'
    submitButton.disabled = true

    // Reset button after 10 seconds if something goes wrong
    setTimeout(() => {
      submitButton.textContent = originalText
      submitButton.disabled = false
    }, 10000)
  }

  console.log('✅ Form validation passed, submitting...')
}

// Add custom styles
function addFormStyles() {
  if (document.querySelector('#nodewave-registration-styles')) {
    return
  }

  const styles = document.createElement('style')
  styles.id = 'nodewave-registration-styles'
  styles.innerHTML = `
		.field-error {
			color: #d9534f !important;
			font-size: 12px !important;
			margin-top: 4px !important;
			display: block !important;
		}

		input:focus {
			outline: none !important;
			border-color: #4945ff !important;
			box-shadow: 0 0 0 2px rgba(73, 69, 255, 0.2) !important;
		}

		input[type="email"]:disabled,
		input[type="email"][readonly] {
			background-color: #ffffff !important;
			opacity: 1 !important;
			cursor: text !important;
		}

		.registration-info {
			background-color: #f8f9fa;
			border: 1px solid #dee2e6;
			border-radius: 4px;
			padding: 12px;
			margin-bottom: 16px;
			font-size: 14px;
			color: #6c757d;
		}
	`

  document.head.appendChild(styles)
}

// Add helpful information about registration
function addRegistrationInfo() {
  if (
    window.location.pathname.includes('/admin/auth/register') &&
    !window.location.pathname.includes('register-admin')
  ) {
    const form = document.querySelector('form')
    if (form && !document.querySelector('.registration-info')) {
      const infoDiv = document.createElement('div')
      infoDiv.className = 'registration-info'
      infoDiv.innerHTML = `
				<strong>📝 Creating your Author Account</strong><br>
				• You'll automatically get Author permissions to create and manage blog posts<br>
				• Email verification may be required depending on system settings<br>
				• Use a valid email address for account recovery
			`

      form.insertBefore(infoDiv, form.firstChild)
    }
  }
}

// Main initialization function
function initializeRegistrationEnhancements() {
  fixRegistrationForm()
  addRegistrationInfo()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRegistrationEnhancements)
} else {
  initializeRegistrationEnhancements()
}

// Also initialize on navigation changes
window.addEventListener('popstate', () => {
  setTimeout(initializeRegistrationEnhancements, 100)
})

// Watch for route changes in SPAs
const originalPushState = history.pushState
history.pushState = function (state, title, url) {
  originalPushState.call(history, state, title, url)
  setTimeout(initializeRegistrationEnhancements, 100)
}

const originalReplaceState = history.replaceState
history.replaceState = function (state, title, url) {
  originalReplaceState.call(history, state, title, url)
  setTimeout(initializeRegistrationEnhancements, 100)
}
