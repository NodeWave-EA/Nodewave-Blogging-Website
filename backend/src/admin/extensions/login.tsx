/**
 * Login page customization script
 * Injects registration link into the login page and handles admin registration control
 */

// Function to check if super admin exists
async function checkSuperAdminExists() {
  try {
    // Use our custom API endpoint to check super admin status
    const response = await fetch('/admin/super-admin-status')

    if (response.ok) {
      const data = await response.json()
      console.log('Super admin status:', data)
      return data.hasSuperAdmin
    } else {
      console.warn('Could not check super admin status, response not ok:', response.status)
      return true // Default to true for security
    }
  } catch (error) {
    console.warn('Could not check super admin status:', error)
    return true // Default to true for security
  }
}

// Function to handle admin registration page
async function handleAdminRegistrationPage() {
  if (window.location.pathname !== '/admin/auth/register-admin') {
    return
  }

  const hasSuperAdmin = await checkSuperAdminExists()
  if (hasSuperAdmin) {
    console.log('🚫 Redirecting from register-admin - Super Admin already exists')
    window.location.href = '/admin/auth/register'
  }
}

// Function to inject registration link
function addRegistrationLink() {
  // Check if we're on the login page and not already injected
  if (
    window.location.pathname !== '/admin/auth/login' ||
    document.querySelector('#nodewave-registration-link')
  ) {
    return
  }

  // Wait for login form to be rendered
  const interval = setInterval(() => {
    const loginForm =
      document.querySelector('form[role="presentation"]') ||
      document.querySelector('form[aria-labelledby="login-title"]') ||
      document.querySelector('form')

    if (loginForm && !document.querySelector('#nodewave-registration-link')) {
      // Create registration link container
      const linkContainer = document.createElement('div')
      linkContainer.id = 'nodewave-registration-link'
      linkContainer.innerHTML = `
        <style>
          #nodewave-registration-link {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 1.5rem;
            padding: 1rem;
            text-align: center;
          }

          #nodewave-registration-link a {
            color: #4f46e5;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            border: 1px solid transparent;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }

          #nodewave-registration-link a:hover {
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
            color: #3730a3;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-color: #e2e8f0;
          }

          #nodewave-registration-link a:focus {
            outline: none;
            ring: 2px solid #4f46e5;
            ring-offset: 2px;
          }

          #nodewave-registration-link .icon {
            width: 1rem;
            height: 1rem;
          }

          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            #nodewave-registration-link a {
              color: #a5b4fc;
              background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
              border-color: #475569;
            }

            #nodewave-registration-link a:hover {
              background: linear-gradient(135deg, #334155 0%, #475569 100%);
              color: #c7d2fe;
              border-color: #64748b;
            }
          }
        </style>
        <a href="/admin/auth/register" class="registration-link" aria-label="Create an account">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
          Don't have an account? Create one here
        </a>
      `

      // Insert after the form
      if (loginForm && !document.querySelector('#nodewave-registration-link')) {
        // Insert directly after the login form so the link appears below it
        loginForm.insertAdjacentElement('afterend', linkContainer)
        clearInterval(interval)
        console.log('✅ Registration link added to login page')
      }
    }
  }, 500)

  // Clear interval after 10 seconds to prevent infinite checking
  setTimeout(() => clearInterval(interval), 10000)
}

// Main initialization function
function initialize() {
  addRegistrationLink()
  handleAdminRegistrationPage()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize)
} else {
  initialize()
}

// Also check when navigation occurs (for SPAs)
window.addEventListener('popstate', () => {
  setTimeout(initialize, 100)
})

// Watch for route changes in SPAs
if (typeof (window as any).__nodewave_originalPushState === 'undefined') {
  ;(window as any).__nodewave_originalPushState = history.pushState
  history.pushState = function (state, title, url) {
    ;(window as any).__nodewave_originalPushState.call(history, state, title, url)
    setTimeout(initialize, 100)
  }
}

if (typeof (window as any).__nodewave_originalReplaceState === 'undefined') {
  ;(window as any).__nodewave_originalReplaceState = history.replaceState
  history.replaceState = function (state, title, url) {
    ;(window as any).__nodewave_originalReplaceState.call(history, state, title, url)
    setTimeout(initialize, 100)
  }
}
