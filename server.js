const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve src files (for development compatibility)
app.use('/src', express.static(path.join(__dirname, 'src')));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    
    // Check if index.html exists
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <h1>Build files not found</h1>
            <p>Please run 'npm run build:renderer' to build the application.</p>
        `);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Scriptor Umbra AI server running on port ${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'build')}`);
    console.log(`🔗 Access the app at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});