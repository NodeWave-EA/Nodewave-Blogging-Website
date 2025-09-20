/**
 * Search routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/search',
      handler: 'search.globalSearch',
      config: {
        auth: false,
        description: 'Global search across all content types',
        tags: ['Search'],
        parameters: {
          query: {
            q: {
              type: 'string',
              description: 'Search query',
              required: true,
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of results',
              default: 20,
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/search/quick',
      handler: 'search.quickSearch',
      config: {
        auth: false,
        description: 'Quick search for autocomplete',
        tags: ['Search'],
        parameters: {
          query: {
            q: {
              type: 'string',
              description: 'Search query',
              required: true,
            },
            type: {
              type: 'string',
              enum: ['post', 'author', 'category', 'tag'],
              description: 'Content type to search',
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of results',
              default: 5,
            },
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/search/suggestions',
      handler: 'search.searchSuggestions',
      config: {
        auth: false,
        description: 'Get search suggestions for autocomplete',
        tags: ['Search'],
        parameters: {
          query: {
            q: {
              type: 'string',
              description: 'Search query (minimum 2 characters)',
              required: true,
            },
            limit: {
              type: 'integer',
              description: 'Maximum number of suggestions',
              default: 10,
            },
          },
        },
      },
    },
  ],
}
