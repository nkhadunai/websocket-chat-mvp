// public/js/main.js

/**
 * Main application entry point
 */
(function() {
    // Generate random username
    const USERNAME = 'user_' + getRandomInt(0, 1000);
    const WS_URL = `ws://${window.location.hostname}:${window.location.port || 3000}`;

    // Initialize UI manager
    const ui = new ChatUI();

    // Initialize WebSocket client
    const wsClient = new WebSocketClient(WS_URL, USERNAME);

    /**
     * Generates random integer
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (inclusive)
     * @returns {number} Random integer
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Handles sending a message
     */
    function sendMessage() {
        const message = ui.getMessageInput();

        if (!message) {
            return;
        }

        if (!wsClient.isConnected()) {
            ui.showError('Not connected to server');
            return;
        }

        // Display message immediately in UI
        ui.addMessage(USERNAME, message, wsClient.userColor, true);

        // Send to server
        const sent = wsClient.sendMessage(message);

        if (sent) {
            ui.clearMessageInput();
            ui.focusMessageInput();
        } else {
            ui.showError('Failed to send message');
        }
    }

    // WebSocket callbacks
    wsClient.onConnected = () => {
        console.log('Connected to chat server');
        ui.showConnectionStatus(true);
        ui.setInputDisabled(false);
        ui.addSystemMessage('Connected to chat server');
    };

    wsClient.onDisconnected = () => {
        console.log('Disconnected from chat server');
        ui.showConnectionStatus(false);
        ui.setInputDisabled(true);
        ui.addSystemMessage('Disconnected from server');
    };

    wsClient.onSettingsReceived = (data) => {
        console.log('Settings received:', data);
    };

    wsClient.onMessageReceived = (data) => {
        if (data.type === 'SYSTEM') {
            ui.addSystemMessage(data.message);
        } else if (data.type === 'NEW_MESSAGE') {
            ui.addMessage(data.sender, data.message, data.senderColour, false);
        }
    };

    wsClient.onError = (error) => {
        console.error('WebSocket error:', error);
        ui.showError(error);
    };

    // Event listeners
    const sendButton = document.querySelector('.chat-input button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Handle page unload
    window.addEventListener('beforeunload', () => {
        wsClient.disconnect();
    });

    // Connect to WebSocket server
    wsClient.connect();

    // Initial UI state
    ui.showConnectionStatus(false);
    ui.setInputDisabled(true);
    ui.addSystemMessage(`Welcome! You are ${USERNAME}`);

})();