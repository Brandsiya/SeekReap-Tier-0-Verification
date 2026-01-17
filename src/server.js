const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Remove trailing slash
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
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h1 { color: #2563eb; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            .status { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0; }
            pre { background: #1e293b; color: #f1f5f9; padding: 15px; border-radius: 8px; overflow-x: auto; }
            code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; }
            .endpoint { background: #dbeafe; padding: 10px; border-radius: 6px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>🚀 SeekReap Tier 0 Verification</h1>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Status:</strong> <span class="status">✅ Operational</span></p>
          <p><strong>Deployed:</strong> ${new Date().toISOString()}</p>
          <p><strong>GitHub:</strong> <a href="https://github.com/Brandsiya/SeekReap-Tier-0-Verification" target="_blank">View Source</a></p>
          
          <div class="card">
            <h3>📡 API Endpoints:</h3>
            <div class="endpoint"><code>GET /api/verify</code> - Verification endpoint</div>
            <div class="endpoint"><code>GET /api/health</code> - Health check</div>
            <div class="endpoint"><code>GET /api/status</code> - System status</div>
            <div class="endpoint"><code>GET /api/version</code> - CLI version</div>
          </div>
          
          <div class="card">
            <h3>🔧 Quick Test:</h3>
            <pre>curl https://seekreap-tier0-verification.onrender.com/api/verify</pre>
            <p>Or click: <a href="/api/verify" target="_blank">/api/verify</a></p>
          </div>
          
          <div class="card">
            <h3>📊 System Info:</h3>
            <p><strong>Node.js:</strong> ${process.version}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
            <p><strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds</p>
          </div>
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
        version: '/api/version',
        root: '/'
      },
      documentation: 'https://github.com/Brandsiya/SeekReap-Tier-0-Verification'
    }, null, 2));
  }
  else if (trimmedPath === 'api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'seekreap-tier0-verification',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    }, null, 2));
  }
  else if (trimmedPath === 'api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'operational',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      timestamp: new Date().toISOString()
    }, null, 2));
  }
  else if (trimmedPath === 'api/version') {
    const { exec } = require('child_process');
    exec('node cli.js --version', (error, stdout, stderr) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: stderr }, null, 2));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          cli: stdout.trim(),
          server: '1.0.0',
          node: process.version
        }, null, 2));
      }
    });
    return;
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Path ${path} does not exist`,
      available_endpoints: ['/', '/api/verify', '/api/health', '/api/status', '/api/version'],
      timestamp: new Date().toISOString()
    }, null, 2));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ SeekReap Tier 0 server running on port ${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   • http://localhost:${PORT}/`);
  console.log(`   • http://localhost:${PORT}/api/verify`);
  console.log(`   • http://localhost:${PORT}/api/health`);
  console.log(`   • http://localhost:${PORT}/api/status`);
  console.log(`   • http://localhost:${PORT}/api/version`);
  console.log(`🌐 Render URL: https://seekreap-tier0-verification.onrender.com`);
});
