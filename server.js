// server.js
const http = require('http');
const WebSocket = require('ws');
const createApp = require('./src/app');
const { PORT, HOST } = require('./src/config/constants');
const { createVerifyClient } = require('./src/middleware/websocketAuth');
const ConnectionManager = require('./src/services/ConnectionManager');
const { handleConnection } = require('./src/handlers/websocketHandler');

// Create Express app
const app = createApp();

// Create HTTP server
const server = http.createServer(app);

// Create connection manager
const connectionManager = new ConnectionManager();

// Create WebSocket server
const wss = new WebSocket.Server({
    server: server,
    verifyClient: createVerifyClient(connectionManager)
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    handleConnection(ws, req, connectionManager);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing connections...');
    connectionManager.closeAll();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing connections...');
    connectionManager.closeAll();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Start server
server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
    console.log(`WebSocket server ready`);
});

module.exports = server;