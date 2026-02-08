const { startServer } = require('./server');
const { startScanning } = require('./scanner');
const { log } = require('./utils');
const ethers = require('ethers');
const CONFIG = require('./config');

async function main() {
    log('Initializing SNI-PER Bot...', 'INFO');

    // Start Dashboard
    const io = startServer();

    // Initialize Position Manager
    const positionManager = require('./position-manager');

    // Connect to Blockchain
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);

    let wallet;
    try {
        wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        log(`Wallet connected: ${wallet.address}`, 'SUCCESS');
    } catch (e) {
        log(`Invalid Private Key. Generating random wallet for SIMULATION ONLY.`, 'WARNING');
        wallet = ethers.Wallet.createRandom().connect(provider);
    }

    // Init Position Manager
    positionManager.init(provider, wallet, io);

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
