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
        'Auth.form.welcome.title': 'Welcome to NodeWave Blog Admin',
        'Auth.form.welcome.subtitle': 'Manage your professional blog content',
        'app.components.HomePage.welcome': 'Welcome to NodeWave Blog Admin Panel',
        'app.components.HomePage.welcome.again': 'Welcome back to NodeWave Blog Admin!',
        'Settings.profile.form.section.experience.interfaceLanguageHelp':
          'Preference changes will apply only to you.',
      },
    },
  },
  bootstrap() {
    console.log('🚀 NodeWave Blog Admin Panel Initialized')

    // No custom styling, use Strapi defaults
  },
}
