/**
 * API Documentation Utility
 * Generates API documentation from routes
 */

class APIDocGenerator {
  constructor() {
    this.routes = [];
  }

  /**
   * Register a route for documentation
   */
  registerRoute(route) {
    this.routes.push(route);
  }

  /**
   * Generate OpenAPI/Swagger documentation
   */
  generateOpenAPISpec() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'RoleReady API',
        version: '1.0.0',
        description: 'AI-powered career management platform API'
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Development server'
        }
      ],
      paths: this.generatePaths(),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };
  }

  /**
   * Generate paths from registered routes
   */
  generatePaths() {
    const paths = {};
    
    this.routes.forEach(route => {
      if (!paths[route.path]) {
        paths[route.path] = {};
      }
      
      paths[route.path][route.method.toLowerCase()] = {
        summary: route.summary || '',
        description: route.description || '',
        tags: route.tags || [],
        parameters: route.parameters || [],
        requestBody: route.requestBody || undefined,
        responses: route.responses || {
          '200': { description: 'Success' },
          '400': { description: 'Bad Request' },
          '401': { description: 'Unauthorized' }
        },
        security: route.auth ? [{ bearerAuth: [] }] : []
      };
    });
    
    return paths;
  }
}

module.exports = new APIDocGenerator();

