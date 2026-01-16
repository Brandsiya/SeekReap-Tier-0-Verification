const http = require('http');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    exec('node cli.js --version', (error, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>SeekReap Tier 0</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>SeekReap Tier 0 Verification</h1>
            <p><strong>Version:</strong> ${stdout || 'Error: ' + stderr}</p>
            <p><strong>Status:</strong> ✅ Operational</p>
            <p><strong>GitHub:</strong> <a href="https://github.com/Brandsiya/SeekReap-Tier-0-Verification">View Source</a></p>
            <hr>
            <h3>Usage:</h3>
            <pre>curl https://seekreap-tier0-verification.onrender.com/api/verify</pre>
          </body>
        </html>
      `);
    });
  } else if (req.url === '/api/verify') {
    exec('node cli.js verify examples/basic/basic-policy.json', (error, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: !error,
        output: stdout || stderr,
        timestamp: new Date().toISOString()
      }, null, 2));
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`SeekReap server running on port ${port}`);
});
