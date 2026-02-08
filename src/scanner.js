const { Contract } = require('ethers');
const CONFIG = require('./config');
const { log } = require('./utils');
const sniper = require('./sniper');

async function startScanning(provider, io) {
    log('Starting Token Scanner...', 'INFO');

    const factoryAbi = [
        "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
    ];

    const factoryContract = new Contract(CONFIG.FACTORY_ADDRESS, factoryAbi, provider);

    log(`Listening for new pairs on ${CONFIG.FACTORY_ADDRESS}`, 'INFO');

    // In ethers v6, contract.on takes the event name directly
    await factoryContract.on('PairCreated', async (token0, token1, pairAddress, event) => {
        // Identify which token is WBNB and which is the new token
        let newTokenAddress = null;
        let pairName = '';

        if (token0.toLowerCase() === CONFIG.WBNB_ADDRESS.toLowerCase()) {
            newTokenAddress = token1;
            pairName = `WBNB / ${newTokenAddress.substring(0, 6)}...`;
        } else if (token1.toLowerCase() === CONFIG.WBNB_ADDRESS.toLowerCase()) {
            newTokenAddress = token0;
            pairName = `${newTokenAddress.substring(0, 6)}... / WBNB`;
        }

        if (newTokenAddress) {
            const message = `New Pair Detected: ${pairAddress} | Token: ${newTokenAddress}`;
            log(message, 'SNIPE');

            // Notify Dashboard
            if (io) io.emit('newPair', { token: newTokenAddress, pair: pairAddress, time: new Date().toISOString() });

            // Trigger Sniper
            await sniper.snipe(newTokenAddress, pairAddress, provider, io);
        }
    });

    // Keep alive log
    setInterval(() => {
        log('Scanner is active and listening...', 'INFO');
    }, 60000);
}

module.exports = { startScanning };
