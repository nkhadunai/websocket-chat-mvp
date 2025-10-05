// src/config/constants.js

/**
 * Application configuration constants
 */
module.exports = {
    // Server configuration
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',

    // WebSocket configuration
    WS_HEARTBEAT_INTERVAL: 30000, // 30 seconds
    WS_HEARTBEAT_TIMEOUT: 35000,  // 35 seconds

    // Username validation
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    USERNAME_PATTERN: /^[a-zA-Z0-9_\-]+$/,

    // Message limits
    MESSAGE_MAX_LENGTH: 1000,

    // Message types
    MESSAGE_TYPES: {
        SETTINGS: 'SETTINGS',
        NEW_MESSAGE: 'NEW_MESSAGE',
        USER_JOINED: 'USER_JOINED',
        USER_LEFT: 'USER_LEFT',
        ERROR: 'ERROR'
    }
};