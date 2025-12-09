export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      allowedHosts: ['localhost', '127.0.0.1', 'vps-e5e8d3b4.vps.ovh.net'],

      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http://vps-e5e8d3b4.vps.ovh.net:1337'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',
            '*.googleapis.com',
            '*.gstatic.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',
          ],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          'frame-src': ["'self'"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      headers: '*',
      origin: [
        // Development origins
        'http://localhost:3000',
        'http://localhost:5174',
        'http://localhost:5173',
        'http://localhost:4173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:4173',

        // VPS origins
        'http://vps-e5e8d3b4.vps.ovh.net:5173',
        'http://vps-e5e8d3b4.vps.ovh.net:1337',

        // Production origins
        'https://nodewave-blogs.vercel.app',

        // Environment variables (can be set in deployment)
        process.env.FRONTEND_URL,
        process.env.STRAPI_ADMIN_CLIENT_URL,

        // Add your custom domains here
      ].filter(Boolean), // Remove any undefined/null values
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true,
      maxAge: 86400,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]
