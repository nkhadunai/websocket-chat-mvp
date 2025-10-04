// server.js
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));
// Create an HTTP server
const server = http.createServer(app);

const usernameConnectionMap = new Map();

const wss = new WebSocket.Server({
    server: server,
    verifyClient: (info) => {
        const query = url.parse(info.req.url, true).query;
        const username = query.username;

        if (!username) {
            console.error(`Username is not set`);
            return false;
        }

        if (!username.match(/^[a-zA-Z0-9_\-]+$/)) {
            console.error(`Invalid username or password`);
            return false;
        }

        if (usernameConnectionMap.has(username)) {
            console.error(`Invalid username or password - ${username} is already connected`);
            return false;
        }

        // Store username for later use
        info.req.username = username;
        return true;
    }
});

wss.on('connection', (ws, req) => {
    const username = req.username;
    console.log(`User ${username} connected`);

    ws.username = username;
    ws.userColour = ChatColorManager.generateUserColor(username);
    usernameConnectionMap.set(username, ws);

    ws.send(JSON.stringify({
        type: 'SETTINGS',
        userColour: ws.userColour
    }));

    // Handle messages from the client
    ws.on('message', (wsMessage) => {
        // Broadcast to all usernameConnectionMap
        const message = JSON.parse(wsMessage);
        console.log('Received message', message.message);

        const senderColour = usernameConnectionMap.get(message.sender).userColour;
        for (const [username, connection] of usernameConnectionMap.entries()) {
            if (connection.readyState === WebSocket.OPEN && username !== message.sender) {
                connection.send(JSON.stringify({
                    type: 'NEW_MESSAGE',
                    sender: message.sender,
                    senderColour: senderColour,
                    message: message.message
                })); // Broadcast raw JSON string
            }
        }
    });

    // Clean up on disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
        usernameConnectionMap.delete(ws);
        clearInterval(interval);
    });

    // Handle errors
    ws.on('error', (err) => {
        console.error(`WebSocket error: ${err}`);
    });
});

// Start HTTP + WebSocket server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

class ChatColorManager {
    static generateUserColor(username) {
        // Create hash of username
        const hash = crypto.createHash('md5').update(username).digest('hex');

        // Convert first 6 characters to RGB
        const r = parseInt(hash.substr(0, 2), 16);
        const g = parseInt(hash.substr(2, 2), 16);
        const b = parseInt(hash.substr(4, 2), 16);

        // Ensure minimum brightness for readability
        const adjustedR = Math.max(r, 100);
        const adjustedG = Math.max(g, 100);
        const adjustedB = Math.max(b, 100);

        return `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
    }

    // Alternative: HSL for better color control
    static generateUserColorHSL(username) {
        const hash = crypto.createHash('md5').update(username).digest('hex');
        const hashInt = parseInt(hash.substr(0, 8), 16);

        const hue = hashInt % 360;
        const saturation = 65 + (hashInt % 20); // 65-85%
        const lightness = 45 + (hashInt % 15);  // 45-60%

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
}