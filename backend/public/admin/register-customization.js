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

  // Fix email field - more aggressive approach
  const emailInput = findEmailInput(form)

  if (emailInput) {
    console.log('📧 Fixing email input field...')

    // Remove all possible disabled attributes and styling
    emailInput.disabled = false
    emailInput.readOnly = false
    emailInput.required = true
    emailInput.removeAttribute('disabled')
    emailInput.removeAttribute('readonly')
    emailInput.removeAttribute('aria-disabled')

    // Set proper attributes
    emailInput.setAttribute('type', 'email')
    emailInput.setAttribute('autoComplete', 'email')
    emailInput.setAttribute('placeholder', 'Enter your email address')

    // Force enable styling
    emailInput.style.backgroundColor = '#ffffff !important'
    emailInput.style.opacity = '1 !important'
    emailInput.style.cursor = 'text !important'
    emailInput.style.pointerEvents = 'auto !important'
    emailInput.style.color = '#374151 !important'

    // Remove disabled classes
    emailInput.classList.remove('disabled', 'readonly', 'cursor-not-allowed')
    emailInput.classList.add('cursor-text')

    // Apply TailwindCSS v4 utility classes for styling
    emailInput.classList.add(
      'w-full',
      'px-4',
      'py-2',
      'border',
      'rounded-md',
      'focus:outline-none',
      'focus:ring-2'
    )

    // Add validation
    emailInput.addEventListener('blur', validateEmail)
    emailInput.addEventListener('input', handleEmailInput)

    // Force focus capability
    emailInput.addEventListener('click', function () {
      this.focus()
    })

    // Watch for dynamic changes that might disable it again
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'disabled' || mutation.attributeName === 'readonly')
        ) {
          emailInput.disabled = false
          emailInput.readOnly = false
          emailInput.style.backgroundColor = '#ffffff !important'
          emailInput.style.opacity = '1 !important'
          emailInput.style.cursor = 'text !important'
        }
      })
    })

    observer.observe(emailInput, { attributes: true })
  }

  // Find and enhance other form fields
  const usernameInput =
    form.querySelector('input[name="username"]') ||
    form.querySelector('input[placeholder*="username" i]') ||
    form.querySelector('input[placeholder*="name" i]')

  const passwordInput =
    form.querySelector('input[type="password"]') || form.querySelector('input[name="password"]')

  if (usernameInput) {
    usernameInput.required = true
    usernameInput.classList.add('w-full', 'px-4', 'py-2', 'border', 'rounded-md')
    usernameInput.setAttribute('required', 'true')
  }

  if (passwordInput) {
    passwordInput.required = true
    passwordInput.classList.add('w-full', 'px-4', 'py-2', 'border', 'rounded-md')
    passwordInput.setAttribute('required', 'true')
  }

  // Add placeholder and aria-label for accessibility
  if (emailInput) {
    emailInput.setAttribute(
      'placeholder',
      emailInput.getAttribute('placeholder') || 'you@domain.com'
    )
    emailInput.setAttribute('aria-label', emailInput.getAttribute('aria-label') || 'Email')
  }

  if (usernameInput) {
    usernameInput.setAttribute(
      'placeholder',
      usernameInput.getAttribute('placeholder') || 'Your display name'
    )
    usernameInput.setAttribute('aria-label', usernameInput.getAttribute('aria-label') || 'Username')
  }

  if (passwordInput) {
    passwordInput.setAttribute(
      'placeholder',
      passwordInput.getAttribute('placeholder') || 'Choose a strong password'
    )
    passwordInput.setAttribute('aria-label', passwordInput.getAttribute('aria-label') || 'Password')
  }

  // Add custom styling for better UX
  addFormStyles()

  // Add form submission handler for better error handling
  form.addEventListener('submit', handleFormSubmission)

  console.log('✅ Registration form enhanced successfully')
}

// More comprehensive email input finder
function findEmailInput(form) {
  // Try multiple selectors to find email input
  const selectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input[placeholder*="Email" i]',
    'input[id*="email" i]',
    'input[autocomplete="email"]',
  ]

  for (const selector of selectors) {
    const input = form.querySelector(selector)
    if (input) {
      return input
    }
  }

  // Fallback: look for any input that might be an email field
  const inputs = form.querySelectorAll('input[type="text"], input:not([type])')
  for (const input of inputs) {
    const placeholder = input.placeholder?.toLowerCase() || ''
    const name = input.name?.toLowerCase() || ''
    const id = input.id?.toLowerCase() || ''

    if (placeholder.includes('email') || name.includes('email') || id.includes('email')) {
      return input
    }
  }

  return null
}

// Handle email input changes
function handleEmailInput(event) {
  const input = event.target
  // Remove any error styling as user types
  removeFieldError(input)

  // Ensure the field stays enabled
  if (input.disabled || input.readOnly) {
    input.disabled = false
    input.readOnly = false
  }
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

// Show field error with modern styling
function showFieldError(input, message) {
  const container = input.closest('div') || input.parentElement
  let errorElement = container.querySelector('.field-error')

  if (!errorElement) {
    errorElement = document.createElement('div')
    errorElement.className = 'field-error'
    container.appendChild(errorElement)
  }

  errorElement.textContent = message
  input.classList.add('error')
  input.classList.remove('success')
}

// Show field success with modern styling
function showFieldSuccess(input) {
  input.classList.add('success')
  input.classList.remove('error')
}

// Remove field error
function removeFieldError(input) {
  const container = input.closest('div') || input.parentElement
  const errorElement = container.querySelector('.field-error')

  if (errorElement) {
    errorElement.remove()
  }

  input.classList.remove('error', 'success')
}

// Handle form submission with enhanced feedback
function handleFormSubmission(event) {
  console.log('📝 Processing registration form submission...')

  const form = event.target
  const emailInput = findEmailInput(form)
  const usernameInput =
    form.querySelector('input[name="username"]') ||
    form.querySelector('input[placeholder*="username" i]') ||
    form.querySelector('input[placeholder*="name" i]')
  const passwordInput =
    form.querySelector('input[type="password"]') || form.querySelector('input[name="password"]')

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

    // Show user-friendly error message
    showFormError(form, 'Please fix the errors above before submitting.')
    return false
  }

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]')
  if (submitButton) {
    const originalText = submitButton.textContent
    const originalHTML = submitButton.innerHTML

    submitButton.innerHTML = `
			<svg style="display: inline-block; width: 1rem; height: 1rem; margin-right: 0.5rem; animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24">
				<circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			Creating Account...
		`
    submitButton.disabled = true

    // Add spin animation
    const style = document.createElement('style')
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
    document.head.appendChild(style)

    // Reset button after 15 seconds if something goes wrong
    setTimeout(() => {
      submitButton.innerHTML = originalHTML || originalText
      submitButton.disabled = false
      removeFormError(form)
    }, 15000)
  }

  // Remove any existing error messages
  removeFormError(form)

  console.log('✅ Form validation passed, submitting...')
}

// Show form-level error message
function showFormError(form, message) {
  removeFormError(form) // Remove existing error first

  const errorDiv = document.createElement('div')
  errorDiv.className = 'form-error'
  errorDiv.style.cssText = `
		background-color: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	`

  errorDiv.innerHTML = `
		<svg style="width: 1rem; height: 1rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
		</svg>
		${message}
	`

  form.insertBefore(errorDiv, form.firstChild)
}

// Remove form-level error message
function removeFormError(form) {
  const errorDiv = form.querySelector('.form-error')
  if (errorDiv) {
    errorDiv.remove()
  }
}

// Add custom styles
function addFormStyles() {
  if (document.querySelector('#nodewave-registration-styles')) {
    return
  }

  const styles = document.createElement('style')
  styles.id = 'nodewave-registration-styles'
  styles.innerHTML = `
		/* Field error styling with TailwindCSS v4 approach */
		.field-error {
			color: #ef4444 !important;
			font-size: 0.75rem !important;
			line-height: 1rem !important;
			margin-top: 0.25rem !important;
			display: block !important;
			font-weight: 500 !important;
		}

		/* Input focus states with modern design */
		input:focus {
			outline: none !important;
			border-color: #4f46e5 !important;
			box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
			ring: 2px solid #4f46e5 !important;
			ring-offset: 1px !important;
		}

		/* Email input specific styling */
		input[type="email"],
		input[name="email"],
		input[placeholder*="email" i] {
			background-color: #ffffff !important;
			opacity: 1 !important;
			cursor: text !important;
			pointer-events: auto !important;
			color: #374151 !important;
		}

		/* Disabled input override */
		input[type="email"]:disabled,
		input[type="email"][readonly],
		input[name="email"]:disabled,
		input[name="email"][readonly] {
			background-color: #ffffff !important;
			opacity: 1 !important;
			cursor: text !important;
			pointer-events: auto !important;
			color: #374151 !important;
		}

		/* Registration info box with modern card design */
		.registration-info {
			background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
			border: 1px solid #e2e8f0;
			border-radius: 0.75rem;
			padding: 1rem;
			margin-bottom: 1.5rem;
			font-size: 0.875rem;
			line-height: 1.5;
			color: #475569;
			box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		}

		.registration-info strong {
			color: #334155;
			font-weight: 600;
		}

		/* Success state styling */
		input.success {
			border-color: #10b981 !important;
			box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
		}

		/* Error state styling */
		input.error {
			border-color: #ef4444 !important;
			box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
		}

		/* Loading state for submit button */
		button:disabled {
			opacity: 0.7 !important;
			cursor: not-allowed !important;
		}

		/* Form container enhancements */
		form {
			position: relative;
		}

		/* Dark mode support */
		@media (prefers-color-scheme: dark) {
			.field-error {
				color: #fca5a5 !important;
			}

			.registration-info {
				background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
				border-color: #475569;
				color: #cbd5e1;
			}

			.registration-info strong {
				color: #f1f5f9;
			}

			input[type="email"],
			input[name="email"] {
				background-color: #1f2937 !important;
				color: #f9fafb !important;
			}

			input:focus {
				border-color: #6366f1 !important;
				box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
			}
		}

		/* Animation for smooth transitions */
		input, .field-error, .registration-info {
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		}

		/* Enhanced placeholder styling */
		input::placeholder {
			color: #9ca3af;
			opacity: 1;
		}

		/* Focus-within for form containers */
		.form-group:focus-within {
			transform: translateY(-1px);
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
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
					<svg style="width: 1.25rem; height: 1.25rem; color: #4f46e5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<strong>📝 Creating your NodeWave Author Account</strong>
				</div>
				<div style="margin-left: 1.75rem;">
					<div style="margin-bottom: 0.5rem;">✍️ You'll automatically get Author permissions to create and manage blog posts</div>
					<div style="margin-bottom: 0.5rem;">📧 Email verification may be required depending on system settings</div>
					<div style="margin-bottom: 0.5rem;">🔐 Use a valid email address for account recovery and notifications</div>
					<div>🚀 Start publishing your content immediately after registration</div>
				</div>
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
