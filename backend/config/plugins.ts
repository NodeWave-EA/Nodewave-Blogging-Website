export default () => ({
  // SEO Plugin
  seo: {
    enabled: true,
  },

  // GraphQL Plugin
  graphql: {
    enabled: true,
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      defaultLimit: 100,
      maxLimit: 250,
      apolloServer: {
        introspection: true,
        playground: process.env.NODE_ENV === 'development',
      },
    },
  },

  // Documentation Plugin
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'NodeWave Blog API',
        description: 'Professional Company Blogging Platform API',
        contact: {
          name: 'NodeWave Blog Support',
          email: 'support@nodewave.blog',
        },
      },
      servers: [
        {
          url: process.env.STRAPI_API_URL ?? 'http://localhost:1337',
          description: 'Development server',
        },
      ],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  },

  // Users & Permissions
  'users-permissions': {
    enabled: true,
    config: {
      jwt: {
        expiresIn: '7d',
      },
      jwtSecret: process.env.JWT_SECRET ?? 'default-jwt-secret-please-change',
      ratelimit: {
        interval: 60000,
        max: 10,
      },
    },
  },

  // Upload
  upload: {
    enabled: true,
    config: {
      sizeLimit: 250 * 1024 * 1024, // 250MB
      providerOptions: {
        localServer: {
          maxage: 300000,
        },
      },
      breakpoints: {
        small: 500,
        medium: 1000,
        large: 1920,
      },
    },
  },
})
