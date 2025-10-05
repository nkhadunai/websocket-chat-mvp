// src/handlers/websocketHandler.js
const { MESSAGE_TYPES, MESSAGE_MAX_LENGTH } = require('../config/constants');
const ChatColorManager = require('../services/ChatColorManager');

/**
 * Handles WebSocket connection events
 * @param {WebSocket} ws - WebSocket connection
 * @param {http.IncomingMessage} req - HTTP request object
 * @param {ConnectionManager} connectionManager - Connection manager instance
 */
function handleConnection(ws, req, connectionManager) {
    const username = req.username;
    const userColor = ChatColorManager.generateUserColor(username);

    // Store user info on the WebSocket object
    ws.username = username;
    ws.userColor = userColor;

    // Add connection to manager
    connectionManager.addConnection(username, ws);

    // Send initial settings to the user
    ws.send(JSON.stringify({
        type: MESSAGE_TYPES.SETTINGS,
        userColour: userColor
    }));

    // Notify other users that someone joined
    connectionManager.broadcastMessage(username, {
        type: MESSAGE_TYPES.USER_JOINED,
        username: username,
        timestamp: Date.now()
    });

    // Handle incoming messages
    ws.on('message', (wsMessage) => {
        handleMessage(ws, wsMessage, connectionManager);
    });

    // Handle disconnection
    ws.on('close', () => {
        handleDisconnect(ws, connectionManager);
    });

    // Handle errors
    ws.on('error', (error) => {
        handleError(ws, error, connectionManager);
    });
}

/**
 * Handles incoming messages from a client
 * @param {WebSocket} ws - WebSocket connection
 * @param {string} wsMessage - Raw message string
 * @param {ConnectionManager} connectionManager - Connection manager instance
 */
function handleMessage(ws, wsMessage, connectionManager) {
    try {
        const message = JSON.parse(wsMessage);

        // Validate message
        if (!message.sender || !message.message) {
            console.error('Invalid message format:', message);
            return;
        }

        // Validate message length
        if (message.message.length > MESSAGE_MAX_LENGTH) {
            ws.send(JSON.stringify({
                type: MESSAGE_TYPES.ERROR,
                error: `Message too long. Maximum ${MESSAGE_MAX_LENGTH} characters.`
            }));
            return;
        }

        // Verify sender matches connection
        if (message.sender !== ws.username) {
            console.error(`Username mismatch: ${message.sender} vs ${ws.username}`);
            return;
        }

        console.log(`Message from ${message.sender}: ${message.message}`);

        // Broadcast message to all other users
        const senderConnection = connectionManager.getConnection(message.sender);
        connectionManager.broadcastMessage(message.sender, {
            type: MESSAGE_TYPES.NEW_MESSAGE,
            sender: message.sender,
            senderColour: senderConnection.userColor,
            message: message.message,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({
            type: MESSAGE_TYPES.ERROR,
            error: 'Failed to process message'
        }));
    }
}

/**
 * Handles client disconnection
 * @param {WebSocket} ws - WebSocket connection
 * @param {ConnectionManager} connectionManager - Connection manager instance
 */
function handleDisconnect(ws, connectionManager) {
    const username = ws.username;

    if (username) {
        connectionManager.removeConnection(username);

        // Notify other users
        connectionManager.broadcastToAll({
            type: MESSAGE_TYPES.USER_LEFT,
            username: username,
            timestamp: Date.now()
        });
    }
}

/**
 * Handles WebSocket errors
 * @param {WebSocket} ws - WebSocket connection
 * @param {Error} error - Error object
 * @param {ConnectionManager} connectionManager - Connection manager instance
 */
function handleError(ws, error, connectionManager) {
    console.error(`WebSocket error for user ${ws.username}:`, error);

    // Clean up connection on error
    if (ws.username) {
        connectionManager.removeConnection(ws.username);
    }
}

module.exports = {
    handleConnection,
    handleMessage,
    handleDisconnect,
    handleError
};