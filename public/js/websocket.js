// public/js/websocket.js

/**
 * WebSocket client manager
 */
class WebSocketClient {
    constructor(url, username) {
        this.url = url;
        this.username = username;
        this.socket = null;
        this.userColor = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;

        // Callbacks
        this.onMessageReceived = null;
        this.onConnected = null;
        this.onDisconnected = null;
        this.onError = null;
        this.onSettingsReceived = null;
    }

    /**
     * Establishes WebSocket connection
     */
    connect() {
        try {
            this.socket = new WebSocket(`${this.url}?username=${this.username}`);

            this.socket.onopen = () => this.handleOpen();
            this.socket.onmessage = (event) => this.handleMessage(event);
            this.socket.onclose = (event) => this.handleClose(event);
            this.socket.onerror = (error) => this.handleError(error);

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            if (this.onError) {
                this.onError(error.message);
            }
        }
    }

    /**
     * Handles connection open event
     */
    handleOpen() {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;

        if (this.onConnected) {
            this.onConnected();
        }
    }

    /**
     * Handles incoming messages
     * @param {MessageEvent} event - WebSocket message event
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('Received message type:', data.type);

            switch (data.type) {
                case 'SETTINGS':
                    this.userColor = data.userColour;
                    if (this.onSettingsReceived) {
                        this.onSettingsReceived(data);
                    }
                    break;

                case 'NEW_MESSAGE':
                    if (this.onMessageReceived) {
                        this.onMessageReceived(data);
                    }
                    break;

                case 'USER_JOINED':
                    console.log(`User ${data.username} joined`);
                    if (this.onMessageReceived) {
                        this.onMessageReceived({
                            type: 'SYSTEM',
                            message: `${data.username} joined the chat`
                        });
                    }
                    break;

                case 'USER_LEFT':
                    console.log(`User ${data.username} left`);
                    if (this.onMessageReceived) {
                        this.onMessageReceived({
                            type: 'SYSTEM',
                            message: `${data.username} left the chat`
                        });
                    }
                    break;

                case 'ERROR':
                    console.error('Server error:', data.error);
                    if (this.onError) {
                        this.onError(data.error);
                    }
                    break;

                default:
                    console.warn('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    /**
     * Handles connection close event
     * @param {CloseEvent} event - WebSocket close event
     */
    handleClose(event) {
        console.log('WebSocket disconnected:', event.code, event.reason);

        if (this.onDisconnected) {
            this.onDisconnected();
        }

        // Attempt reconnection if not intentional
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay);
        }
    }

    /**
     * Handles WebSocket errors
     * @param {Event} error - Error event
     */
    handleError(error) {
        console.error('WebSocket error:', error);

        if (this.onError) {
            this.onError('Connection error occurred');
        }
    }

    /**
     * Sends a message through the WebSocket
     * @param {string} message - Message text to send
     * @returns {boolean} True if sent successfully
     */
    sendMessage(message) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            if (this.onError) {
                this.onError('Not connected to server');
            }
            return false;
        }

        try {
            const payload = {
                sender: this.username,
                message: message
            };

            this.socket.send(JSON.stringify(payload));
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            if (this.onError) {
                this.onError('Failed to send message');
            }
            return false;
        }
    }

    /**
     * Closes the WebSocket connection
     */
    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'User disconnected');
        }
    }

    /**
     * Checks if WebSocket is connected
     * @returns {boolean} True if connected
     */
    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketClient;
}