/**
 * API Documentation Generator
 * Generates OpenAPI/Swagger documentation from route handlers
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const schema = {
  openapi: '3.0.0',
  info: {
    title: 'RoleReady API',
    version: '1.0.0',
    description: 'Complete API documentation for RoleReady job search platform'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://api.roleready.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {}
};

function registerEndpoint(method, path, options = {}) {
  if (!schema.paths[path]) {
    schema.paths[path] = {};
  }

  schema.paths[path][method.toLowerCase()] = {
    summary: options.summary || '',
    description: options.description || '',
    tags: options.tags || [],
    security: options.authRequired ? [{ bearerAuth: [] }] : [],
    parameters: options.parameters || [],
    requestBody: options.requestBody || undefined,
    responses: options.responses || {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object'
            }
          }
        }
      }
    }
  };
}

function generateDocumentation() {
  const outputPath = path.join(__dirname, '../docs/api-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
  logger.info('✅ API documentation generated at:', outputPath);
  
  // Also generate HTML using redoc-cli if available
  // npx redoc-cli bundle docs/api-spec.json -o docs/api-docs.html
}

module.exports = {
  registerEndpoint,
  generateDocumentation,
  schema
};
