interface EnvFunction {
  (key: string, defaultValue?: string | number | boolean): string
  bool(key: string, defaultValue?: boolean): boolean
  int(key: string, defaultValue?: number): number
}

export default ({ env }: { env: EnvFunction }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    jwtMaxAge: env.int('JWT_TIMEOUT', 30 * 24 * 60 * 60 * 1000), // 30 days in ms
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  auditLogs: {
    enabled: env.bool('AUDIT_LOGS_ENABLED', true),
    retentionDays: env.int('AUDIT_LOGS_RETENTION_DAYS', 90),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  autoOpen: false,
  watchIgnoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/tmp/**',
    '**/documentation/**',
    '**/.git/**',
  ],
})
