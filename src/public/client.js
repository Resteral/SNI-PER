const socket = io();

const pairsList = document.getElementById('pairs-list');
const tradesList = document.getElementById('trades-list');
const sysLogs = document.getElementById('system-logs');

socket.on('newPair', (data) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="timestamp">${new Date(data.time).toLocaleTimeString()}</span> 
                    <strong>${data.token}</strong> <br> 
                    <small>${data.pair}</small>`;
    pairsList.prepend(li);
});

socket.on('trade', (data) => {
    const li = document.createElement('li');
    li.className = data.type.includes('BUY') ? 'trade-buy' : 'trade-sell';
    li.innerHTML = `<span class="timestamp">${new Date(data.time).toLocaleTimeString()}</span>
                    <strong>${data.type}</strong> ${data.amount} BNB <br>
                    <small>${data.token}</small>`;
    tradesList.prepend(li);
});

socket.on('log', (data) => {
    // Optional: Stream full logs here if connected to backend logger
});
