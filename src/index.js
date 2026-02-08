const { startServer } = require('./server');
const { startScanning } = require('./scanner');
const { log } = require('./utils');
const ethers = require('ethers');
const CONFIG = require('./config');

async function main() {
    log('Initializing SNI-PER Bot...', 'INFO');

    // Start Dashboard
    const io = startServer();

    // Connect to Blockchain
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);

    try {
        const network = await provider.getNetwork();
        log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`, 'SUCCESS');

        // Start Scanner
        startScanning(provider, io);

    } catch (error) {
        log(`Failed to connect to RPC: ${error.message}`, 'ERROR');
    }
}

main();
