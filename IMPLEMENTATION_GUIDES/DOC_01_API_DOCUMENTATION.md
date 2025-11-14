# API Documentation Implementation Guide (OpenAPI/Swagger)

## Overview
Create comprehensive, interactive API documentation using OpenAPI 3.0 specification and Swagger UI. This enables developers to understand, test, and integrate with your Files API.

**Implementation Time**: 6-8 hours
**Priority**: P1 (Essential for developer experience)
**Cost**: Free (open source tools)

---

## 1️⃣ Install Dependencies

```bash
cd apps/api
npm install @fastify/swagger @fastify/swagger-ui
npm install --save-dev @types/swagger-ui-express
```

---

## 2️⃣ Configure Swagger in Fastify

Update `apps/api/server.js`:

```javascript
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

const fastify = Fastify({
  logger: true
});

// Register Swagger
await fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'RoleRabbit Files API',
      description: 'Complete file management API with upload, download, sharing, versioning, and collaboration features',
      version: '1.0.0',
      contact: {
        name: 'RoleRabbit Support',
        email: 'support@rolerabbit.com',
        url: 'https://rolerabbit.com/support'
      },
      license: {
        name: 'Proprietary',
        url: 'https://rolerabbit.com/terms'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.rolerabbit.com',
        description: 'Production server'
      }
    ],
    tags: [
      { name: 'files', description: 'File management operations' },
      { name: 'folders', description: 'Folder operations' },
      { name: 'sharing', description: 'File sharing and permissions' },
      { name: 'versions', description: 'File version control' },
      { name: 'comments', description: 'File comments and discussions' },
      { name: 'search', description: 'Search and filtering' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from authentication endpoint'
        }
      },
      schemas: {
        // Define reusable schemas (see section 3)
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  }
});

// Register Swagger UI
await fastify.register(fastifySwaggerUI, {
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
  theme: {
    title: 'RoleRabbit Files API Documentation',
    favicon: '/favicon.ico'
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 5000, host: '0.0.0.0' });
    console.log('📚 API Documentation available at: http://localhost:5000/api/docs');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

---

## 3️⃣ Define Reusable Schemas

Create `apps/api/schemas/fileSchemas.js`:

```javascript
// File object schema
export const FileSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', description: 'Unique file identifier' },
    name: { type: 'string', description: 'File name with extension', example: 'resume.pdf' },
    type: { type: 'string', description: 'MIME type', example: 'application/pdf' },
    size: { type: 'integer', description: 'File size in bytes', example: 1024000 },
    storagePath: { type: 'string', description: 'Internal storage path' },
    folderId: { type: 'string', format: 'uuid', nullable: true, description: 'Parent folder ID' },
    userId: { type: 'string', format: 'uuid', description: 'Owner user ID' },
    isDeleted: { type: 'boolean', description: 'Soft delete flag', default: false },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
    deletedAt: { type: 'string', format: 'date-time', nullable: true, description: 'Deletion timestamp' },
    thumbnailUrl: { type: 'string', format: 'uri', nullable: true, description: 'Thumbnail URL for images' },
    downloadUrl: { type: 'string', format: 'uri', description: 'Signed download URL' },
    metadata: {
      type: 'object',
      nullable: true,
      description: 'Custom metadata (JSON)',
      example: { tags: ['important', 'work'], color: 'blue' }
    }
  },
  required: ['id', 'name', 'type', 'size', 'userId', 'createdAt']
};

// Pagination metadata schema
export const PaginationMetaSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', description: 'Current page number', example: 1 },
    limit: { type: 'integer', description: 'Items per page', example: 50 },
    total: { type: 'integer', description: 'Total items', example: 247 },
    totalPages: { type: 'integer', description: 'Total pages', example: 5 },
    hasNextPage: { type: 'boolean', description: 'Has next page', example: true },
    hasPrevPage: { type: 'boolean', description: 'Has previous page', example: false }
  }
};

// Error response schema
export const ErrorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string', description: 'Error message', example: 'File not found' },
    code: { type: 'string', description: 'Error code', example: 'FILE_NOT_FOUND' },
    statusCode: { type: 'integer', description: 'HTTP status code', example: 404 }
  },
  required: ['error', 'statusCode']
};

// File version schema
export const FileVersionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fileId: { type: 'string', format: 'uuid' },
    version: { type: 'integer', description: 'Version number', example: 3 },
    size: { type: 'integer', description: 'Version file size in bytes' },
    changeNote: { type: 'string', nullable: true, description: 'Change description', example: 'Updated pricing section' },
    createdAt: { type: 'string', format: 'date-time' },
    createdBy: { type: 'string', format: 'uuid', description: 'User who created this version' }
  }
};

// Share link schema
export const ShareSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fileId: { type: 'string', format: 'uuid' },
    token: { type: 'string', description: 'Unique share token', example: 'abc123xyz' },
    permission: { type: 'string', enum: ['view', 'comment', 'edit'], description: 'Access level' },
    expiresAt: { type: 'string', format: 'date-time', nullable: true, description: 'Expiration date' },
    maxDownloads: { type: 'integer', nullable: true, description: 'Maximum download count', example: 10 },
    downloadCount: { type: 'integer', description: 'Current download count', example: 3 },
    password: { type: 'string', nullable: true, description: 'Share password (hashed)' },
    createdAt: { type: 'string', format: 'date-time' }
  }
};

// Comment schema
export const CommentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fileId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    content: { type: 'string', description: 'Comment text', example: 'Great work on this!' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        avatar: { type: 'string', format: 'uri', nullable: true }
      }
    }
  }
};
```

---

## 4️⃣ Document API Endpoints

Update `apps/api/routes/storage.routes.js` with OpenAPI schema:

```javascript
// GET /api/storage/files - List files with pagination
fastify.get('/files', {
  preHandler: [authenticate],
  schema: {
    description: 'List all files with pagination and filtering',
    tags: ['files'],
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1, description: 'Page number' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 50, description: 'Items per page' },
        folderId: { type: 'string', format: 'uuid', description: 'Filter by folder' },
        includeDeleted: { type: 'boolean', default: false, description: 'Include deleted files' },
        search: { type: 'string', description: 'Search query (filename, content)' },
        type: { type: 'string', description: 'Filter by MIME type prefix', example: 'image/' },
        sortBy: { type: 'string', enum: ['name', 'createdAt', 'size'], default: 'createdAt' },
        sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
      }
    },
    response: {
      200: {
        description: 'Successful response',
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: FileSchema
          },
          meta: PaginationMetaSchema
        }
      },
      401: {
        description: 'Unauthorized',
        ...ErrorSchema
      },
      500: {
        description: 'Server error',
        ...ErrorSchema
      }
    },
    security: [{ bearerAuth: [] }]
  }
}, async (request, reply) => {
  // Handler implementation
});

// POST /api/storage/files/upload - Upload file
fastify.post('/files/upload', {
  preHandler: [authenticate],
  schema: {
    description: 'Upload a new file',
    tags: ['files'],
    consumes: ['multipart/form-data'],
    body: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 50MB)'
        },
        folderId: {
          type: 'string',
          format: 'uuid',
          description: 'Target folder ID (optional)'
        },
        metadata: {
          type: 'string',
          description: 'JSON string of custom metadata (optional)'
        }
      },
      required: ['file']
    },
    response: {
      200: {
        description: 'File uploaded successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          file: FileSchema
        }
      },
      400: {
        description: 'Bad request (invalid file, size exceeded, etc.)',
        ...ErrorSchema
      },
      401: {
        description: 'Unauthorized',
        ...ErrorSchema
      },
      413: {
        description: 'File too large',
        ...ErrorSchema
      }
    },
    security: [{ bearerAuth: [] }]
  }
}, async (request, reply) => {
  // Handler implementation
});

// GET /api/storage/files/:id - Get file details
fastify.get('/files/:id', {
  preHandler: [authenticate],
  schema: {
    description: 'Get file details by ID',
    tags: ['files'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'File ID' }
      },
      required: ['id']
    },
    response: {
      200: {
        description: 'File details',
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          file: FileSchema
        }
      },
      403: {
        description: 'Access denied',
        ...ErrorSchema
      },
      404: {
        description: 'File not found',
        ...ErrorSchema
      }
    },
    security: [{ bearerAuth: [] }]
  }
}, async (request, reply) => {
  // Handler implementation
});

// DELETE /api/storage/files/:id - Delete file (soft delete)
fastify.delete('/files/:id', {
  preHandler: [authenticate],
  schema: {
    description: 'Soft delete a file (move to trash)',
    tags: ['files'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'File ID' }
      },
      required: ['id']
    },
    querystring: {
      type: 'object',
      properties: {
        permanent: {
          type: 'boolean',
          default: false,
          description: 'Permanently delete (cannot be restored)'
        }
      }
    },
    response: {
      200: {
        description: 'File deleted successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'File moved to trash' }
        }
      },
      403: {
        description: 'Access denied',
        ...ErrorSchema
      },
      404: {
        description: 'File not found',
        ...ErrorSchema
      }
    },
    security: [{ bearerAuth: [] }]
  }
}, async (request, reply) => {
  // Handler implementation
});

// POST /api/storage/files/:id/share - Create share link
fastify.post('/files/:id/share', {
  preHandler: [authenticate],
  schema: {
    description: 'Create a shareable link for a file',
    tags: ['sharing'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'File ID' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      properties: {
        permission: {
          type: 'string',
          enum: ['view', 'comment', 'edit'],
          default: 'view',
          description: 'Access level for shared users'
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'Expiration date (optional)'
        },
        maxDownloads: {
          type: 'integer',
          minimum: 1,
          description: 'Maximum download count (optional)'
        },
        password: {
          type: 'string',
          minLength: 6,
          description: 'Password protect the share link (optional)'
        }
      },
      required: ['permission']
    },
    response: {
      200: {
        description: 'Share link created',
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          share: ShareSchema,
          shareUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://rolerabbit.com/share/abc123xyz'
          }
        }
      },
      403: {
        description: 'Access denied',
        ...ErrorSchema
      },
      404: {
        description: 'File not found',
        ...ErrorSchema
      }
    },
    security: [{ bearerAuth: [] }]
  }
}, async (request, reply) => {
  // Handler implementation
});

// GET /api/storage/files/:id/versions - List file versions
fastify.get('/files/:id/versions', {
  preHandler: [authenticate],
  schema: {
    description: 'Get version history for a file',
    tags: ['versions'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'File ID' }
      },
      required: ['id']
    },
    response: {
      200: {
        description: 'Version history',
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          versions: {
            type: 'array',
            items: FileVersionSchema
          }
        }
      },
      403: {
        description: 'Access denied',
        ...ErrorSchema
      },
      404: {
        description: 'File not found',
        ...ErrorSchema
      }
    },
    security: [{ bearerAuth: [] }]
  }
}, async (request, reply) => {
  // Handler implementation
});

// POST /api/storage/files/:id/comments - Add comment
fastify.post('/files/:id/comments', {
  preHandler: [authenticate],
  schema: {
    description: 'Add a comment to a file',
    tags: ['comments'],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'File ID' }
      },
      required: ['id']
    },
    body: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          minLength: 1,
          maxLength: 1000,
          description: 'Comment text'
        }
      },
      required: ['content']
    },
    response: {
      200: {
        description: 'Comment added',
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          comment: CommentSchema
        }
      },
      403: {
        description: 'Access denied',
        ...ErrorSchema
      },
      404: {
        description: 'File not found',
        ...ErrorSchema
      }
    },
    security: [{ bearerAuth: [] }]
  }
}, async (request, reply) => {
  // Handler implementation
});

// GET /api/storage/search - Search files
fastify.get('/search', {
  preHandler: [authenticate],
  schema: {
    description: 'Search files by name, content, metadata',
    tags: ['search'],
    querystring: {
      type: 'object',
      properties: {
        q: { type: 'string', minLength: 1, description: 'Search query' },
        type: { type: 'string', description: 'Filter by MIME type', example: 'image/' },
        minSize: { type: 'integer', description: 'Minimum file size in bytes' },
        maxSize: { type: 'integer', description: 'Maximum file size in bytes' },
        createdAfter: { type: 'string', format: 'date-time', description: 'Created after date' },
        createdBefore: { type: 'string', format: 'date-time', description: 'Created before date' },
        tags: { type: 'string', description: 'Comma-separated tags', example: 'work,important' },
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
      },
      required: ['q']
    },
    response: {
      200: {
        description: 'Search results',
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          results: {
            type: 'array',
            items: FileSchema
          },
          meta: PaginationMetaSchema
        }
      }
    },
    security: [{ bearerAuth: [] }]
  }
}, async (request, reply) => {
  // Handler implementation
});
```

---

## 5️⃣ Generate OpenAPI JSON/YAML

Add script to `package.json`:

```json
{
  "scripts": {
    "docs:generate": "node scripts/generateOpenAPISpec.js"
  }
}
```

Create `apps/api/scripts/generateOpenAPISpec.js`:

```javascript
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fs from 'fs';
import yaml from 'js-yaml';

const fastify = Fastify();

await fastify.register(fastifySwagger, {
  openapi: {
    // Your OpenAPI config from server.js
  }
});

// Load all routes
await import('../routes/storage.routes.js');

await fastify.ready();

// Generate JSON
const spec = fastify.swagger();
fs.writeFileSync('./docs/openapi.json', JSON.stringify(spec, null, 2));

// Generate YAML
const yamlSpec = yaml.dump(spec);
fs.writeFileSync('./docs/openapi.yaml', yamlSpec);

console.log('✅ OpenAPI spec generated:');
console.log('  - docs/openapi.json');
console.log('  - docs/openapi.yaml');

process.exit(0);
```

---

## 6️⃣ Add Code Examples for Common Languages

Create `apps/api/docs/examples.md`:

````markdown
# API Code Examples

## Authentication

All API requests require a JWT token in the Authorization header.

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.rolerabbit.com/api/storage/files
```

## JavaScript/TypeScript (fetch)

```typescript
const API_BASE = 'https://api.rolerabbit.com/api/storage';
const token = 'YOUR_JWT_TOKEN';

// List files
async function listFiles() {
  const response = await fetch(`${API_BASE}/files?page=1&limit=50`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return data;
}

// Upload file
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
}

// Create share link
async function shareFile(fileId: string, permission: 'view' | 'edit') {
  const response = await fetch(`${API_BASE}/files/${fileId}/share`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ permission })
  });

  return await response.json();
}
```

## Python (requests)

```python
import requests

API_BASE = 'https://api.rolerabbit.com/api/storage'
TOKEN = 'YOUR_JWT_TOKEN'

headers = {
    'Authorization': f'Bearer {TOKEN}'
}

# List files
def list_files():
    response = requests.get(f'{API_BASE}/files', headers=headers)
    return response.json()

# Upload file
def upload_file(file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            f'{API_BASE}/files/upload',
            headers=headers,
            files=files
        )
    return response.json()

# Download file
def download_file(file_id, output_path):
    response = requests.get(
        f'{API_BASE}/files/{file_id}/download',
        headers=headers,
        stream=True
    )

    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
```

## cURL

```bash
# List files
curl -X GET "https://api.rolerabbit.com/api/storage/files?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Upload file
curl -X POST "https://api.rolerabbit.com/api/storage/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf"

# Create share link
curl -X POST "https://api.rolerabbit.com/api/storage/files/FILE_ID/share" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permission": "view", "expiresAt": "2024-12-31T23:59:59Z"}'

# Delete file
curl -X DELETE "https://api.rolerabbit.com/api/storage/files/FILE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search files
curl -X GET "https://api.rolerabbit.com/api/storage/search?q=invoice&type=application/pdf" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
````

---

## 7️⃣ Add Rate Limiting Documentation

Add to OpenAPI spec:

```javascript
{
  openapi: {
    info: {
      // ... other info
      'x-rateLimit': {
        description: 'API rate limits by subscription tier',
        tiers: {
          FREE: {
            uploads: '10 per hour',
            downloads: '50 per hour',
            apiCalls: '100 per hour'
          },
          PRO: {
            uploads: '50 per hour',
            downloads: '200 per hour',
            apiCalls: '500 per hour'
          },
          PREMIUM: {
            uploads: '500 per hour',
            downloads: '2000 per hour',
            apiCalls: '5000 per hour'
          }
        },
        headers: {
          'X-RateLimit-Limit': 'Maximum requests per window',
          'X-RateLimit-Remaining': 'Remaining requests',
          'X-RateLimit-Reset': 'Timestamp when limit resets'
        }
      }
    }
  }
}
```

---

## 8️⃣ Testing the Documentation

### Local Development

```bash
# Start server
npm run dev

# Open documentation
open http://localhost:5000/api/docs
```

### Try It Out Feature

The Swagger UI "Try it out" button allows testing endpoints directly:

1. Click "Authorize" at the top
2. Enter your JWT token: `Bearer YOUR_TOKEN`
3. Click on any endpoint
4. Click "Try it out"
5. Fill in parameters
6. Click "Execute"
7. See response below

---

## 9️⃣ Export Options

### Static HTML

```bash
npm install -g redoc-cli

# Generate static HTML
redoc-cli bundle docs/openapi.yaml -o docs/api-reference.html
```

### Postman Collection

Visit Swagger UI, click "Download" → Select "JSON" → Import into Postman

### SDKs

Generate client SDKs using OpenAPI Generator:

```bash
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript SDK
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-fetch \
  -o sdks/typescript

# Generate Python SDK
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g python \
  -o sdks/python
```

---

## 🔟 Custom Branding (Optional)

Create `apps/api/public/swagger-custom.css`:

```css
/* Custom Swagger UI styling */
.swagger-ui .topbar {
  background-color: #2563eb; /* Your brand color */
}

.swagger-ui .info .title {
  color: #1f2937;
  font-family: 'Inter', sans-serif;
}

.swagger-ui .btn.execute {
  background-color: #2563eb;
  border-color: #2563eb;
}

.swagger-ui .btn.execute:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}
```

Update Swagger UI config:

```javascript
await fastify.register(fastifySwaggerUI, {
  // ... other config
  uiConfig: {
    customCssUrl: '/swagger-custom.css'
  }
});
```

---

## Best Practices

### 1. Always Document
- Every endpoint must have a schema
- Include descriptions for all parameters
- Provide example values
- Document error responses

### 2. Keep It Updated
- Update docs when adding/modifying endpoints
- Version your API (v1, v2, etc.)
- Document breaking changes

### 3. Security
- Require authentication for sensitive endpoints
- Document security requirements clearly
- Don't expose internal implementation details

### 4. Examples
- Provide realistic examples
- Show common use cases
- Include error scenarios

### 5. Versioning
```javascript
servers: [
  {
    url: 'https://api.rolerabbit.com/v1',
    description: 'API v1 (current)'
  },
  {
    url: 'https://api.rolerabbit.com/v2',
    description: 'API v2 (beta)'
  }
]
```

---

## Maintenance Checklist

- ⬜ Add schema to all new endpoints
- ⬜ Update examples when API changes
- ⬜ Test "Try it out" functionality
- ⬜ Review documentation quarterly
- ⬜ Collect feedback from developers
- ⬜ Monitor API usage (which endpoints are popular)
- ⬜ Keep rate limit documentation current
- ⬜ Update SDKs when spec changes

---

## Developer Portal (Advanced)

For a complete developer experience, consider:

1. **Developer Dashboard**
   - API key management
   - Usage analytics
   - Rate limit monitoring

2. **Guides & Tutorials**
   - Getting started guide
   - Common workflows
   - Best practices

3. **Changelog**
   - API version history
   - Breaking changes
   - New features

4. **Status Page**
   - API uptime
   - Incident history
   - Scheduled maintenance

---

## Example Documentation Structure

```
/api/docs/
├── index.html              # Swagger UI
├── openapi.json           # OpenAPI spec (JSON)
├── openapi.yaml           # OpenAPI spec (YAML)
├── examples.md            # Code examples
├── authentication.md      # Auth guide
├── rate-limits.md         # Rate limiting
├── errors.md              # Error codes
├── webhooks.md            # Webhook events
├── changelog.md           # Version history
└── migration/
    └── v1-to-v2.md       # Migration guides
```

---

## Success Metrics

Track these metrics to measure documentation quality:

- **API Adoption Rate**: New developers integrating
- **Support Tickets**: Fewer tickets = better docs
- **Time to First API Call**: How quickly devs get started
- **"Try it Out" Usage**: Swagger UI interaction
- **Documentation Page Views**: Which pages are popular
- **Feedback Scores**: Developer satisfaction

---

## Implementation Time: 6-8 hours

- Setup (1h): Install dependencies, configure Swagger
- Schema Definition (2-3h): Define all reusable schemas
- Endpoint Documentation (2-3h): Add schema to all routes
- Examples & Testing (1-2h): Write examples, test documentation

---

## Cost: Free

All tools are open source:
- @fastify/swagger (MIT license)
- @fastify/swagger-ui (MIT license)
- OpenAPI Generator (Apache 2.0)
- Redoc (MIT license)

---

## Resources

- **OpenAPI 3.0 Spec**: https://swagger.io/specification/
- **Fastify Swagger Plugin**: https://github.com/fastify/fastify-swagger
- **OpenAPI Generator**: https://openapi-generator.tech/
- **Redoc**: https://github.com/Redocly/redoc
- **Swagger UI**: https://swagger.io/tools/swagger-ui/

---

## Conclusion

Comprehensive API documentation:
- ✅ Reduces support burden
- ✅ Accelerates developer onboarding
- ✅ Improves API adoption
- ✅ Enables self-service integration
- ✅ Professional developer experience

**Your Files API will have documentation that rivals Stripe, Twilio, and other API-first companies!**
