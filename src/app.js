const express = require('express');
const path = require('path');

/**
 * Creates and configures Express application
 * @returns {express.Application} Configured Express app
 */
function createApp() {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Serve static files from the "public" folder
    app.use(express.static(path.join(__dirname, '../public')));

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: Date.now() });
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.error('Express error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    return app;
}

module.exports = createApp;