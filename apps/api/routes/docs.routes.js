/**
 * API Documentation Routes
 * 
 * Serves OpenAPI/Swagger documentation
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = async function docsRoutes(fastify) {
  /**
   * Serve Swagger UI
   * GET /api/docs
   */
  fastify.get('/api/docs', async (request, reply) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RoleReady API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .swagger-ui .topbar {
      background-color: #2c3e50;
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api/docs/openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true
      });
      
      window.ui = ui;
    };
  </script>
</body>
</html>
    `;
    
    reply.type('text/html').send(html);
  });

  /**
   * Serve OpenAPI spec (YAML)
   * GET /api/docs/openapi.yaml
   */
  fastify.get('/api/docs/openapi.yaml', async (request, reply) => {
    const yamlPath = path.join(__dirname, '../docs/openapi.yaml');
    
    if (!fs.existsSync(yamlPath)) {
      return reply.status(404).send({
        success: false,
        error: 'OpenAPI specification not found'
      });
    }
    
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    reply.type('text/yaml').send(yamlContent);
  });

  /**
   * Serve OpenAPI spec (JSON)
   * GET /api/docs/openapi.json
   */
  fastify.get('/api/docs/openapi.json', async (request, reply) => {
    const yamlPath = path.join(__dirname, '../docs/openapi.yaml');
    
    if (!fs.existsSync(yamlPath)) {
      return reply.status(404).send({
        success: false,
        error: 'OpenAPI specification not found'
      });
    }
    
    try {
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      const jsonSpec = yaml.load(yamlContent);
      reply.type('application/json').send(jsonSpec);
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to parse OpenAPI specification'
      });
    }
  });

  /**
   * API documentation landing page
   * GET /api/docs/index
   */
  fastify.get('/api/docs/index', async (request, reply) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RoleReady API Documentation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    
    header {
      background: #2c3e50;
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }
    
    header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    
    header p {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    .content {
      padding: 3rem 2rem;
    }
    
    .section {
      margin-bottom: 3rem;
    }
    
    .section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.8rem;
      border-bottom: 3px solid #667eea;
      padding-bottom: 0.5rem;
    }
    
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    
    .card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      border-left: 4px solid #667eea;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .card h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .card p {
      color: #666;
      margin-bottom: 1rem;
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: background 0.2s;
    }
    
    .btn:hover {
      background: #5568d3;
    }
    
    .btn-secondary {
      background: #6c757d;
    }
    
    .btn-secondary:hover {
      background: #5a6268;
    }
    
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    .endpoint-list {
      list-style: none;
      margin-top: 1rem;
    }
    
    .endpoint-list li {
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    .method {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 3px;
      font-weight: bold;
      margin-right: 0.5rem;
      font-size: 0.8em;
    }
    
    .method-get { background: #61affe; color: white; }
    .method-post { background: #49cc90; color: white; }
    .method-put { background: #fca130; color: white; }
    .method-delete { background: #f93e3e; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 RoleReady API Documentation</h1>
      <p>Complete REST API for Resume Builder Platform</p>
    </header>
    
    <div class="content">
      <div class="section">
        <h2>📚 Documentation Resources</h2>
        <div class="cards">
          <div class="card">
            <h3>Interactive API Explorer</h3>
            <p>Try out API endpoints directly in your browser with Swagger UI</p>
            <a href="/api/docs" class="btn">Open Swagger UI</a>
          </div>
          
          <div class="card">
            <h3>OpenAPI Specification</h3>
            <p>Download the complete API specification in YAML or JSON format</p>
            <a href="/api/docs/openapi.yaml" class="btn btn-secondary">YAML</a>
            <a href="/api/docs/openapi.json" class="btn btn-secondary">JSON</a>
          </div>
          
          <div class="card">
            <h3>Postman Collection</h3>
            <p>Import our API collection into Postman for easy testing</p>
            <a href="/api/docs/postman" class="btn btn-secondary">Download</a>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>🔑 Authentication</h2>
        <p>All endpoints (except public share links) require JWT authentication. Include your token in the Authorization header:</p>
        <code>Authorization: Bearer YOUR_JWT_TOKEN</code>
      </div>
      
      <div class="section">
        <h2>📋 Key Endpoints</h2>
        <ul class="endpoint-list">
          <li><span class="method method-get">GET</span> <code>/api/base-resumes</code> - List all resumes</li>
          <li><span class="method method-post">POST</span> <code>/api/base-resumes</code> - Create resume</li>
          <li><span class="method method-post">POST</span> <code>/api/base-resumes/:id/export</code> - Export resume</li>
          <li><span class="method method-post">POST</span> <code>/api/base-resumes/:id/duplicate</code> - Duplicate resume</li>
          <li><span class="method method-get">GET</span> <code>/api/base-resumes/:id/history</code> - Get resume history</li>
          <li><span class="method method-post">POST</span> <code>/api/base-resumes/:id/share</code> - Create share link</li>
          <li><span class="method method-get">GET</span> <code>/api/base-resumes/:id/analytics</code> - Get analytics</li>
          <li><span class="method method-get">GET</span> <code>/api/resume-templates</code> - List templates</li>
          <li><span class="method method-get">GET</span> <code>/api/tailored-versions/:id</code> - Get tailored version</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>⚡ Rate Limiting</h2>
        <p>API requests are limited to <strong>60 requests per minute per user</strong>. When the limit is exceeded, you'll receive a <code>429 Too Many Requests</code> response.</p>
      </div>
      
      <div class="section">
        <h2>🔗 Quick Links</h2>
        <div class="cards">
          <div class="card">
            <h3>Code Examples</h3>
            <p>JavaScript, Python, and cURL examples</p>
            <a href="/api/docs/examples" class="btn btn-secondary">View Examples</a>
          </div>
          
          <div class="card">
            <h3>API Changelog</h3>
            <p>Track API changes and breaking updates</p>
            <a href="/api/docs/changelog" class="btn btn-secondary">View Changelog</a>
          </div>
          
          <div class="card">
            <h3>Support</h3>
            <p>Need help? Contact our support team</p>
            <a href="mailto:support@roleready.com" class="btn btn-secondary">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
    
    reply.type('text/html').send(html);
  });
};

