// public/js/ui.js

/**
 * UI Manager for chat interface
 */
class ChatUI {
    constructor() {
        this.chatWindow = document.getElementById('chat-window');
        this.messageInput = document.getElementById('message-input');
    }

    /**
     * Creates a message block element
     * @param {string} username - Sender's username
     * @param {string} message - Message text
     * @param {string} color - Username color
     * @param {boolean} isOwnMessage - Whether this is the current user's message
     * @returns {HTMLElement} Message block element
     */
    createMessageBlock(username, message, color, isOwnMessage = false) {
        const messageBlock = document.createElement('div');
        messageBlock.classList.add('message-block', isOwnMessage ? 'user' : 'server');

        const usernameDiv = document.createElement('div');
        usernameDiv.classList.add('username');
        usernameDiv.style.color = color;
        usernameDiv.textContent = username;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isOwnMessage ? 'user' : 'server');
        messageDiv.textContent = message;

        messageBlock.appendChild(usernameDiv);
        messageBlock.appendChild(messageDiv);

        return messageBlock;
    }

    /**
     * Adds a message to the chat window
     * @param {string} username - Sender's username
     * @param {string} message - Message text
     * @param {string} color - Username color
     * @param {boolean} isOwnMessage - Whether this is the current user's message
     */
    addMessage(username, message, color, isOwnMessage = false) {
        const messageBlock = this.createMessageBlock(username, message, color, isOwnMessage);
        this.chatWindow.appendChild(messageBlock);
        this.scrollToBottom();
    }

    /**
     * Adds a system message to the chat
     * @param {string} message - System message text
     */
    addSystemMessage(message) {
        const messageBlock = document.createElement('div');
        messageBlock.classList.add('message-block', 'system');

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'system');
        messageDiv.textContent = message;

        messageBlock.appendChild(messageDiv);
        this.chatWindow.appendChild(messageBlock);
        this.scrollToBottom();
    }

    /**
     * Scrolls chat window to the bottom
     */
    scrollToBottom() {
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    /**
     * Gets the current message input value
     * @returns {string} Trimmed message text
     */
    getMessageInput() {
        return this.messageInput.value.trim();
    }

    /**
     * Clears the message input field
     */
    clearMessageInput() {
        this.messageInput.value = '';
    }

    /**
     * Focuses the message input field
     */
    focusMessageInput() {
        this.messageInput.focus();
    }

    /**
     * Shows connection status
     * @param {boolean} connected - Whether connected to server
     */
    showConnectionStatus(connected) {
        const header = document.querySelector('.chat-header');
        if (connected) {
            header.textContent = '💬 Chat Room (Connected)';
            header.style.backgroundColor = '#007bff';
        } else {
            header.textContent = '💬 Chat Room (Disconnected)';
            header.style.backgroundColor = '#dc3545';
        }
    }

    /**
     * Disables or enables the input
     * @param {boolean} disabled - Whether to disable input
     */
    setInputDisabled(disabled) {
        this.messageInput.disabled = disabled;
        const sendButton = document.querySelector('.chat-input button');
        if (sendButton) {
            sendButton.disabled = disabled;
        }
    }

    /**
     * Shows an error message in the UI
     * @param {string} errorMessage - Error message to display
     */
    showError(errorMessage) {
        this.addSystemMessage(`❌ Error: ${errorMessage}`);
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatUI;
}