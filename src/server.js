const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route handling
  if (trimmedPath === '' || trimmedPath === 'index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SeekReap Tier 0 - WORKING</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #2563eb; }
            .status { color: #10b981; font-weight: bold; }
            .endpoint { background: #f1f5f9; padding: 10px; border-radius: 6px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>🚀 SeekReap Tier 0 Verification</h1>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Status:</strong> <span class="status">✅ Operational</span></p>
          <p><strong>Deployed:</strong> ${new Date().toISOString()}</p>
          
          <h3>📡 API Endpoints:</h3>
          <div class="endpoint"><code>GET /api/verify</code> - Verification endpoint</div>
          <div class="endpoint"><code>GET /api/health</code> - Health check</div>
          <div class="endpoint"><code>GET /api/status</code> - System status</div>
          
          <h3>🔧 Quick Test:</h3>
          <pre>curl ${process.env.RENDER_EXTERNAL_URL || 'https://seekreap-tier0-verification.onrender.com'}/api/verify</pre>
        </body>
      </html>
    `);
  }
  else if (trimmedPath === 'api/verify') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      service: 'seekreap-tier0-verification',
      message: 'SeekReap Tier 0 Verification API is operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        verify: '/api/verify',
        health: '/api/health',
        status: '/api/status',
        root: '/'
      }
    }, null, 2));
  }
  else if (trimmedPath === 'api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'seekreap-tier0-verification',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: process.env.PORT || 3000
    }, null, 2));
  }
  else if (trimmedPath === 'api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'operational',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      node: process.version,
      port: process.env.PORT || 3000,
      timestamp: new Date().toISOString()
    }, null, 2));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Path ${path} does not exist`,
      available_endpoints: ['/', '/api/verify', '/api/health', '/api/status']
    }, null, 2));
  }
});

// CRITICAL FIX: Use Render's PORT environment variable
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ SeekReap Tier 0 server running on port ${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   • http://localhost:${PORT}/`);
  console.log(`   • http://localhost:${PORT}/api/verify`);
  console.log(`   • http://localhost:${PORT}/api/health`);
  console.log(`   • http://localhost:${PORT}/api/status`);
  console.log(`🌐 External URL: ${process.env.RENDER_EXTERNAL_URL || 'https://seekreap-tier0-verification.onrender.com'}`);
});
