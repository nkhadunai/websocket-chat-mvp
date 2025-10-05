const WebSocket = require('ws');
const { MESSAGE_TYPES } = require('../config/constants');

/**
 * Manages WebSocket connections and message broadcasting
 */
class ConnectionManager {
    constructor() {
        this.connections = new Map(); // username -> WebSocket connection
    }

    /**
     * Adds a new connection
     * @param {string} username - Username
     * @param {WebSocket} ws - WebSocket connection
     */
    addConnection(username, ws) {
        this.connections.set(username, ws);
        console.log(`User ${username} connected. Total users: ${this.connections.size}`);
    }

    /**
     * Removes a connection
     * @param {string} username - Username to remove
     * @returns {boolean} True if removed, false if not found
     */
    removeConnection(username) {
        const removed = this.connections.delete(username);
        if (removed) {
            console.log(`User ${username} disconnected. Total users: ${this.connections.size}`);
        }
        return removed;
    }

    /**
     * Checks if a username is already connected
     * @param {string} username - Username to check
     * @returns {boolean} True if connected
     */
    hasConnection(username) {
        return this.connections.has(username);
    }

    /**
     * Gets a connection by username
     * @param {string} username - Username
     * @returns {WebSocket|undefined} WebSocket connection or undefined
     */
    getConnection(username) {
        return this.connections.get(username);
    }

    /**
     * Gets total number of active connections
     * @returns {number} Number of connections
     */
    getConnectionCount() {
        return this.connections.size;
    }

    /**
     * Gets all connected usernames
     * @returns {string[]} Array of usernames
     */
    getConnectedUsers() {
        return Array.from(this.connections.keys());
    }

    /**
     * Broadcasts a message to all connected clients except the sender
     * @param {string} senderUsername - Username of the sender (to exclude)
     * @param {Object} messageData - Message data to broadcast
     */
    broadcastMessage(senderUsername, messageData) {
        const messageString = JSON.stringify(messageData);
        let sentCount = 0;

        for (const [username, connection] of this.connections.entries()) {
            if (username !== senderUsername && connection.readyState === WebSocket.OPEN) {
                connection.send(messageString);
                sentCount++;
            }
        }

        console.log(`Message from ${senderUsername} broadcast to ${sentCount} users`);
    }

    /**
     * Broadcasts a message to all connected clients including the sender
     * @param {Object} messageData - Message data to broadcast
     */
    broadcastToAll(messageData) {
        const messageString = JSON.stringify(messageData);
        let sentCount = 0;

        for (const [username, connection] of this.connections.values()) {
            if (connection.readyState === WebSocket.OPEN) {
                connection.send(messageString);
                sentCount++;
            }
        }

        console.log(`Message broadcast to all ${sentCount} users`);
    }

    /**
     * Sends a message to a specific user
     * @param {string} username - Target username
     * @param {Object} messageData - Message data to send
     * @returns {boolean} True if sent successfully
     */
    sendToUser(username, messageData) {
        const connection = this.connections.get(username);

        if (connection && connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(messageData));
            return true;
        }

        return false;
    }

    /**
     * Closes all connections
     */
    closeAll() {
        for (const [username, connection] of this.connections.entries()) {
            if (connection.readyState === WebSocket.OPEN) {
                connection.close(1000, 'Server shutting down');
            }
        }
        this.connections.clear();
        console.log('All connections closed');
    }
}

module.exports = ConnectionManager;