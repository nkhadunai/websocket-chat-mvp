const USERNAME = 'user_' + getRandomInt(0, 1000);
const socket = new WebSocket('ws://localhost:3000?username=' + USERNAME);
let userColour;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

socket.onmessage = function (event) {
    const parsedData = JSON.parse(event.data);

    console.log(`Received message type ${parsedData.type}`);
    if (parsedData.type === 'SETTINGS') {
        userColour = parsedData.userColour;
    } else if (parsedData.type === 'NEW_MESSAGE') {
        const messageBlock = document.createElement('div');
        messageBlock.classList.add('message-block', 'server');

        const userName = document.createElement('div');
        userName.classList.add('username');
        userName.style.color = parsedData.senderColour; // Assuming color comes from server
        userName.innerText = parsedData.sender;

        const message = document.createElement('div');
        message.classList.add('message', 'server');
        message.textContent = parsedData.message;

        messageBlock.appendChild(userName);
        messageBlock.appendChild(message);

        const chatWindow = document.getElementById('chat-window');
        chatWindow.appendChild(messageBlock);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
};

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (text) {
        const messageBlock = document.createElement('div');
        messageBlock.classList.add('message-block', 'user');

        const userNameDiv = document.createElement('div');
        userNameDiv.classList.add('username');
        userNameDiv.style.color = userColour; // Assuming color comes from server
        userNameDiv.innerText = USERNAME;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'user');
        messageDiv.textContent = text;

        messageBlock.appendChild(userNameDiv);
        messageBlock.appendChild(messageDiv);
        document.getElementById('chat-window').appendChild(messageBlock);

        const message = {
            sender: USERNAME,
            message: text
        }
        socket.send(JSON.stringify(message));
        input.value = '';
    }
}

document.getElementById('send-button').addEventListener('click', sendMessage);

document.getElementById('message-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
});

