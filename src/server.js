const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
// const open = require('open');
const { log } = require('./utils');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Socket connection
io.on('connection', (socket) => {
    log('Dashboard connected', 'INFO');
    // Send initial logs or status if needed
});

function startServer() {
    server.listen(PORT, () => {
        log(`Dashboard running at http://localhost:${PORT}`, 'SUCCESS');
    });
    return io;
}

module.exports = { startServer };
