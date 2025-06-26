const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    // Try to serve from build directory first, then src directory
    let fullPath = path.join(__dirname, 'build', filePath);
    
    // If not in build, try src directory
    if (!fs.existsSync(fullPath)) {
        fullPath = path.join(__dirname, 'src', filePath);
    }
    
    // If still not found, try root directory
    if (!fs.existsSync(fullPath)) {
        fullPath = path.join(__dirname, filePath);
    }

    const extname = path.extname(fullPath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`, 'utf-8');
            }
        } else {
            // Success
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Web server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log('🔥 Ready to use Scriptor Umbra AI in your browser!');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});