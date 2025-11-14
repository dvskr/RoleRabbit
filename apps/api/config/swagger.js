/**
 * Swagger/OpenAPI Configuration
 * Provides API documentation for all endpoints
 */

const swaggerConfig = {
  swagger: {
    info: {
      title: 'RoleRabbit API Documentation',
      description: 'Complete API documentation for the RoleRabbit platform including storage, authentication, resume management, and more',
      version: '1.0.0',
      contact: {
        name: 'RoleRabbit Support',
        email: 'support@rolerabbit.com'
      }
    },
    host: process.env.API_HOST || 'localhost:3001',
    schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http', 'https'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization endpoints' },
      { name: 'Storage', description: 'File and folder management endpoints' },
      { name: 'Files', description: 'File operations including upload, download, and metadata' },
      { name: 'Folders', description: 'Folder structure and organization' },
      { name: 'File Versioning', description: 'File version history and restoration' },
      { name: 'File Tagging', description: 'File categorization with tags' },
      { name: 'Batch Operations', description: 'Bulk file operations' },
      { name: 'Analytics', description: 'Storage analytics and metrics' },
      { name: 'Health', description: 'System health and status checks' }
    ],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT token for authentication. Format: Bearer {token}'
      },
      CookieAuth: {
        type: 'apiKey',
        name: 'auth_token',
        in: 'cookie',
        description: 'JWT token stored in cookie'
      }
    },
    security: [
      { Bearer: [] },
      { CookieAuth: [] }
    ]
  }
};

const swaggerUIConfig = {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: true
};

module.exports = {
  swaggerConfig,
  swaggerUIConfig
};
