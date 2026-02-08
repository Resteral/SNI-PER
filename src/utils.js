const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'bot.log');

function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${type}] ${message}`;

    // Console output with colors
    switch (type) {
        case 'SUCCESS':
            console.log(chalk.green(formattedMessage));
            break;
        case 'ERROR':
            console.log(chalk.red(formattedMessage));
            break;
        case 'WARNING':
            console.log(chalk.yellow(formattedMessage));
            break;
        case 'SNIPE':
            console.log(chalk.magentaBright(formattedMessage));
            break;
        default:
            console.log(chalk.blue(formattedMessage));
    }

    // File output
    fs.appendFileSync(logFile, formattedMessage + '\n');

    return formattedMessage; // Return for dashboard broadcasting
}

module.exports = { log };
