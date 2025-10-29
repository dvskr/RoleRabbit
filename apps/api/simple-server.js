const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Health check
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'node-api',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // API status
  if (path === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'RoleReady Node.js API is running',
      endpoints: {
        users: '/api/users/*',
        resumes: '/api/resumes/*',
        jobs: '/api/jobs/*',
        cloud: '/api/cloud/*',
        health: '/health'
      }
    }));
    return;
  }

  // Auth endpoints
  if (path === '/api/auth/verify' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: null })); // Not authenticated in simple server
    return;
  }

  if (path === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { email, password } = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        user: { id: '1', name: 'Test User', email }
      }));
    });
    return;
  }

  if (path === '/api/auth/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { name, email, password } = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        user: { id: '1', name, email }
      }));
    });
    return;
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 2FA Setup endpoint
  if (path === '/api/auth/2fa/setup' && method === 'POST') {
    const speakeasy = require('speakeasy');
    const qrcode = require('qrcode');
    
    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: 'RoleReady',
      issuer: 'RoleReady'
    });
    
    // Generate QR code
    let qrCodeDataUrl = '';
    qrcode.toDataURL(secret.otpauth_url, (err, url) => {
      if (!err) {
        qrCodeDataUrl = url;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        backupCodes: ['BACKUP1', 'BACKUP2', 'BACKUP3'],
        manualEntryKey: secret.base32
      }));
    });
    return;
  }

  // 2FA Enable endpoint
  if (path === '/api/auth/2fa/enable' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '2FA enabled' }));
    });
    return;
  }

  // 2FA Disable endpoint
  if (path === '/api/auth/2fa/disable' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '2FA disabled' }));
    });
    return;
  }

  // 2FA Status endpoint
  if (path === '/api/auth/2fa/status' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ enabled: false, hasBackupCodes: false }));
    return;
  }

  // User profile endpoint
  if (path === '/api/users/profile' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: { id: '1', name: 'Test User', email: 'test@example.com' } }));
    return;
  }

  // Resume endpoints
  if (path === '/api/resumes' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ resumes: [] }));
    return;
  }

  if (path === '/api/resumes' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const resumeData = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        resume: { ...resumeData, id: Date.now().toString() }
      }));
    });
    return;
  }

  // Job tracking endpoints
  if (path === '/api/jobs' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ jobs: [] }));
    return;
  }

  if (path === '/api/jobs' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const jobData = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        job: { ...jobData, id: Date.now().toString() }
      }));
    });
    return;
  }

  // Cloud storage endpoints
  if (path === '/api/cloud/save' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { resumeData, name } = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        savedResume: { 
          id: Date.now().toString(), 
          name, 
          data: resumeData,
          savedAt: new Date().toISOString()
        }
      }));
    });
    return;
  }

  if (path === '/api/cloud/list' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      savedResumes: [] 
    }));
    return;
  }

  // AI Agents endpoints
  if (path === '/api/agents' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
    return;
  }

  if (path === '/api/agents' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const agentData = JSON.parse(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        agent: { ...agentData, id: Date.now().toString() }
      }));
    });
    return;
  }

  if (path.startsWith('/api/agents/') && method === 'POST') {
    const agentId = path.split('/')[3];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Agent executed successfully',
      agentId 
    }));
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 RoleReady Node.js API running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📋 API status: http://${HOST}:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
