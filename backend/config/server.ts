import { moduleLoaded } from '../utils/debug'

moduleLoaded('config/server.ts')

interface EnvFunction {
  (key: string, defaultValue?: string | number | boolean): string
  int(key: string, defaultValue?: number): number
  array(key: string, defaultValue?: string[]): string[]
  bool(key: string, defaultValue?: boolean): boolean
}

export default ({ env }: { env: EnvFunction }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  middlewares: [
    'strapi::errors',
    'strapi::security',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
    // Custom middleware to control admin registration
    'global::admin-registration-control',
  ],
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  url: env('STRAPI_API_URL', 'http://localhost:1337'),
  admin: {
    autoOpen: false,
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
      jwtMaxAge: env.int('JWT_TIMEOUT', 30 * 24 * 60 * 60 * 1000), // 30 days in ms
    },
    watchIgnoreFiles: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/tmp/**',
      '**/documentation/**',
      '**/.git/**',
    ],
  },
})
