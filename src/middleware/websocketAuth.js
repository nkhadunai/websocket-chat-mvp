const url = require('url');

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidUsername(username) {
    return username && username.match(/^[a-zA-Z0-9_\-]+$/);
}

/**
 * Creates WebSocket verification middleware
 * @param {ConnectionManager} connectionManager - Map of active connections
 * @returns {Function} verifyClient function for WebSocket.Server
 */
function createVerifyClient(connectionManager) {
    return (info, callback) => {
        const query = url.parse(info.req.url, true).query;
        const username = query.username;

        // Check if username is provided
        if (!username) {
            console.error('Connection rejected: Username is not set');
            return callback(false, 400, 'Username is required');
        }

        // Validate username format
        if (!isValidUsername(username)) {
            console.error(`Connection rejected: Invalid username format - ${username}`);
            return callback(false, 400, 'Invalid username format');
        }

        // Check for duplicate connections
        if (connectionManager.hasConnection(username)) {
            console.error(`Connection rejected: Username ${username} is already connected`);
            return callback(false, 409, 'Username already in use');
        }

        // Store username for later use in the connection handler
        info.req.username = username;
        console.log(`Username ${username} validated successfully`);

        return callback(true);
    };
}

module.exports = {
    createVerifyClient,
    isValidUsername
};