/**
 * Login page customization script
 * Injects registration link into the login page
 */

// Function to inject registration link
function addRegistrationLink() {
	// Check if we're on the login page and not already injected
	if (!window.location.pathname.includes('/admin/auth/login') || document.querySelector('#nodewave-registration-link')) {
		return;
	}

	// Wait for login form to be rendered
	const interval = setInterval(() => {
		const loginForm = document.querySelector('form[role="presentation"]') ||
			document.querySelector('form[aria-labelledby="login-title"]') ||
			document.querySelector('form');

		if (loginForm && !document.querySelector('#nodewave-registration-link')) {
			// Create registration link container
			const linkContainer = document.createElement('div');
			linkContainer.id = 'nodewave-registration-link';
			linkContainer.innerHTML = `
        <style>
          #nodewave-registration-link {
            text-align: center;
            margin-top: 24px;
            padding: 16px;
          }
          #nodewave-registration-link a {
            color: #4945ff;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: inline-block;
          }
          #nodewave-registration-link a:hover {
            background-color: #f6f6f9;
            color: #271fe0;
            text-decoration: none;
          }
        </style>
        <a href="/admin/auth/register">
          Need an account? Create one here
        </a>
      `;

			// Insert after the form
			if (loginForm.parentElement) {
				loginForm.parentElement.appendChild(linkContainer);
				clearInterval(interval);
				console.log('✅ Registration link added to login page');
			}
		}
	}, 500);

	// Clear interval after 10 seconds to prevent infinite checking
	setTimeout(() => clearInterval(interval), 10000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', addRegistrationLink);
} else {
	addRegistrationLink();
}

// Also check when navigation occurs (for SPAs)
window.addEventListener('popstate', () => {
	setTimeout(addRegistrationLink, 100);
});

// Watch for route changes in SPAs
if (window.history) {
	const originalPushState = history.pushState;
	history.pushState = function (state, title, url) {
		originalPushState.call(history, state, title, url);
		setTimeout(addRegistrationLink, 100);
	};

	const originalReplaceState = history.replaceState;
	history.replaceState = function (state, title, url) {
		originalReplaceState.call(history, state, title, url);
		setTimeout(addRegistrationLink, 100);
	};
}
