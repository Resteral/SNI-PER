const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');

const envPath = path.join(__dirname, '../.env');

async function setup() {
    // Check if .env exists and has PRIVATE_KEY
    let hasKey = false;
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        if (envContent.includes('PRIVATE_KEY=') && !envContent.includes('PRIVATE_KEY=your_private_key_here')) {
            hasKey = true;
        }
    }

    if (hasKey) {
        console.log(chalk.green('✅ Wallet configuration found. Starting bot...'));
        return;
    }

    // Interactive Setup
    console.log(chalk.blue('=========================================='));
    console.log(chalk.blue('    🔫 SNI-PER BOT SETUP WIZARD 🔫      '));
    console.log(chalk.blue('=========================================='));
    console.log(chalk.yellow('\nNo wallet configuration found!'));
    console.log('To run this bot, you need to provide your Trust Wallet Private Key.');
    console.log(chalk.gray('Your key stays LOCAL on this machine. It is NEVER sent to any server.'));
    console.log(chalk.gray('(If you want to use Simulation Mode with a random wallet, just press ENTER)'));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
        const privateKey = await question(chalk.cyan('\n🔑 Paste your Private Key: '));

        let envContent = '';

        if (privateKey.trim().length > 0) {
            envContent = `PRIVATE_KEY=${privateKey.trim()}\n`;
            console.log(chalk.green('\n✅ Private Key saved!'));
        } else {
            console.log(chalk.yellow('\n⚠️ No key provided. Simulation mode will use a random wallet.'));
        }

        // Ask for Simulation Mode
        const simMode = await question(chalk.cyan('🛠️ Enable Simulation Mode? (Y/n): '));
        const isSim = simMode.toLowerCase() !== 'n';

        envContent += `SIMULATION_MODE=${isSim}\n`;
        envContent += `RPC_URL=https://bsc-dataseed.binance.org/\n`;

        fs.writeFileSync(envPath, envContent);
        console.log(chalk.green('✅ Configuration saved to .env'));
        console.log(chalk.blue('\nStarting bot...'));

    } finally {
        rl.close();
    }
}

setup();
