const socket = io();

const pairsList = document.getElementById('pairs-list');
const tradesList = document.getElementById('trades-list');
const positionsList = document.getElementById('positions-list');
const sysLogs = document.getElementById('system-logs');

socket.on('newPair', (data) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="timestamp">${new Date(data.time).toLocaleTimeString()}</span> 
                    <strong>${data.token}</strong> <br> 
                    <small>${data.pair}</small>`;
    pairsList.prepend(li);
});

socket.on('positions', (data) => {
    positionsList.innerHTML = ''; // Clear current list
    data.forEach(pos => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${pos.token}</strong> | Cost: ${pos.cost} BNB | 
                        <span class="${pos.profit >= 0 ? 'trade-buy' : 'trade-sell'}">
                            ${pos.profit}%
                        </span>`;
        positionsList.appendChild(li);
    });
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
