# API Documentation with Swagger/OpenAPI

This API uses Swagger/OpenAPI 3.0 for comprehensive API documentation.

## Accessing the Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:3001/api/docs
```

## Features

### Interactive Documentation
- Browse all available endpoints organized by tags (Authentication, Storage, Files, Folders, etc.)
- View detailed request/response schemas
- Test API endpoints directly from the browser
- See example requests and responses

### Endpoints Documented

#### Storage API (24 endpoints)
- **Files**: Upload, download, update, delete, restore files
- **Folders**: Create, update, delete folder structures with nesting support
- **Batch Operations**: Bulk delete, move, and restore multiple files
- **File Versioning**: Create versions, list history, restore previous versions
- **File Tagging**: Create tags, add/remove tags from files
- **Analytics**: Storage usage statistics and metrics
- **ZIP Downloads**: Download multiple files as ZIP archive

### Authentication

The API supports two authentication methods:

1. **Bearer Token** (Header)
   ```
   Authorization: Bearer {your_jwt_token}
   ```

2. **Cookie Authentication**
   ```
   auth_token: {your_jwt_token}
   ```

### Using the API Documentation

1. **Navigate to `/api/docs`** after starting the server
2. **Click "Authorize"** button and enter your JWT token
3. **Expand any endpoint** to see details
4. **Click "Try it out"** to test the endpoint
5. **Fill in parameters** and click "Execute"
6. **View the response** below

### API Tags

- **Authentication**: User auth and authorization
- **Files**: File operations (upload, download, metadata)
- **Folders**: Folder structure and organization
- **File Versioning**: Version history and restoration
- **File Tagging**: Categorization with tags
- **Batch Operations**: Bulk file operations
- **Analytics**: Storage metrics and statistics
- **Health**: System health checks

### Example Usage

#### Upload a File
```bash
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "displayName=My Document" \
  -F "type=resume" \
  -F "folderId=folder_id_here"
```

#### List Files with Pagination
```bash
curl http://localhost:3001/api/storage/files?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Download Multiple Files as ZIP
```bash
curl -X POST http://localhost:3001/api/storage/files/download/zip \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileIds": ["file1", "file2", "file3"], "archiveName": "my-files.zip"}' \
  --output my-files.zip
```

#### Create File Version
```bash
curl -X POST http://localhost:3001/api/storage/files/{fileId}/versions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"changeDescription": "Updated resume with new experience"}'
```

#### Add Tag to File
```bash
curl -X POST http://localhost:3001/api/storage/files/{fileId}/tags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tagId": "tag_id_here"}'
```

### Response Formats

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Paginated Response:**
```json
{
  "files": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### File Types

Supported file type values:
- `resume`
- `template`
- `backup`
- `cover_letter`
- `transcript`
- `certification`
- `reference`
- `portfolio`
- `work_sample`
- `document`

### File Size Limits

- **Documents** (PDF, DOC, DOCX, TXT, images): 10MB max
- **Videos** (MP4, WEBM, MOV, AVI): 50MB max

### Supported File Extensions

- **Documents**: .pdf, .doc, .docx, .txt
- **Images**: .png, .jpg, .jpeg
- **Videos**: .mp4, .webm, .mov, .avi

### Rate Limiting

- **Production**: 100 requests per 15 minutes
- **Development**: 10,000 requests per minute (localhost only)

### Security

All file uploads are validated for:
- MIME type verification
- File extension whitelist
- File size limits
- Magic number (file signature) validation
- Path traversal prevention
- Malicious filename detection

### OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
```
http://localhost:3001/api/docs/json
```

You can import this into tools like Postman, Insomnia, or use it for code generation.

## Development

### Adding New Endpoints

1. Create schema in `/schemas/your-module.schemas.js`:
   ```javascript
   const myEndpointSchema = {
     tags: ['Your Tag'],
     summary: 'Endpoint description',
     security: [{ Bearer: [] }],
     params: { ... },
     body: { ... },
     response: {
       200: { ... },
       401: { ... }
     }
   };
   ```

2. Add schema to route:
   ```javascript
   fastify.get('/your-endpoint', {
     schema: myEndpointSchema,
     preHandler: [authenticate]
   }, async (request, reply) => {
     // Handler code
   });
   ```

3. Restart server to see changes

### Swagger Configuration

Configuration is located in `/config/swagger.js`:
- API information (title, description, version)
- Security definitions
- Tags and groupings
- UI customization options

## Troubleshooting

### Documentation not showing up
- Ensure server is running: `npm run dev`
- Check that swagger plugins are installed: `@fastify/swagger` and `@fastify/swagger-ui`
- Clear browser cache

### Schemas not appearing
- Verify schema is imported in route file
- Check that `schema` property is added to route options
- Restart server after schema changes

### Authentication issues
- Click "Authorize" button in Swagger UI
- Enter full JWT token (without "Bearer" prefix)
- Ensure token is valid and not expired

## Resources

- [Fastify Swagger Documentation](https://github.com/fastify/fastify-swagger)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
