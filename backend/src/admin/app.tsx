import favicon from './extensions/favicon.png'
import MenuLogo from './extensions/logo-small.png'
import AuthLogo from './extensions/logo.png'

export default {
  config: {
    // Replace the Strapi logo in auth (login) views
    auth: {
      logo: AuthLogo,
    },
    // Replace the favicon
    head: {
      favicon: favicon,
      title: 'NodeWave Blog Admin',
      script: [
        {
          src: '/admin/login-customization.js',
          defer: true,
        },
        {
          src: '/admin/register-customization.js',
          defer: true,
        },
      ],
    },
    // Replace the Strapi logo in the main navigation
    menu: {
      logo: MenuLogo,
    },
    // Extend the translations
    locales: ['en'],
    // Use only Strapi's default dark theme
    theme: {
      defaultTheme: 'dark',
      disableSwitch: true,
    },
    tutorials: false,
    notifications: {
      releases: false,
    },
    translations: {
      en: {
        'Auth.form.welcome.title': 'NodeWave',
        'Auth.form.welcome.subtitle': 'Welcome back',
        'Auth.form.register.title': 'Join NodeWave',
        'Auth.form.register.subtitle': 'Create your author account',
        'app.components.HomePage.welcome': 'Welcome to NodeWave Blog Admin Panel',
        'app.components.HomePage.welcome.again': 'Welcome back to NodeWave Blog Admin!',
        'Settings.profile.form.section.experience.interfaceLanguageHelp':
          'Preference changes will apply only to you.',
        'Auth.form.button.register': 'Create Account',
        'Auth.link.signin': 'Already have an account? Sign in',
        'Auth.link.signup': 'Need an account? Create one here',
      },
    },
  },
  async bootstrap() {
    console.log('🚀 NodeWave Blog Admin Panel Initialized')

    // Set up default Author role for new registrations
    try {
      const { ensureAuthorRoleExists, checkSuperUserExists } = require('./bootstrap/roles.js')
      const { handleUserRegistration } = require('./bootstrap/registration.js')

      // Check that the Author role exists
      await ensureAuthorRoleExists(strapi)

      // Set up user registration hooks
      await handleUserRegistration(strapi)

      // Check if a super user exists and conditionally enable/disable registration
      const hasSuperUser = await checkSuperUserExists(strapi)

      if (hasSuperUser) {
        console.log('✅ Super Admin exists - Registration available for Authors')
        console.log('🚫 register-admin route will be blocked by middleware')
      } else {
        console.log('⚠️ No Super Admin found - First user will become Super Admin')
        console.log('✅ register-admin route available for first admin')
      }
    } catch (error) {
      console.error('❌ Error during bootstrap:', error)
    }
  },
}
