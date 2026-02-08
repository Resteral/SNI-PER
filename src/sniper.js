const { Wallet, Contract, parseEther, parseUnits } = require('ethers');
const CONFIG = require('./config');
const { log } = require('./utils');
const positionManager = require('./position-manager');

async function snipe(tokenAddress, pairAddress, provider, io) {
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

    log(`Preparing to snipe token: ${tokenAddress}`, 'INFO');

    if (CONFIG.SIMULATION_MODE) {
        log(`[SIMULATION] Simulating buy of ${CONFIG.AMOUNT_TO_BUY_BNB} BNB worth of ${tokenAddress}`, 'SUCCESS');
        log(`[SIMULATION] Transaction "submitted" with 10% slippage.`, 'SUCCESS');

        if (io) io.emit('trade', {
            type: 'BUY (SIMULATED)',
            token: tokenAddress,
            amount: CONFIG.AMOUNT_TO_BUY_BNB,
            status: 'SUCCESS',
            time: new Date().toISOString()
        });

        // Track position even in simulation
        positionManager.addPosition(tokenAddress, parseEther(CONFIG.AMOUNT_TO_BUY_BNB), parseEther(CONFIG.AMOUNT_TO_BUY_BNB));

        return;
    }

    // REAL TRADING LOGIC
    try {
        const routerAbi = [
            "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
        ];

        const router = new Contract(CONFIG.ROUTER_ADDRESS, routerAbi, wallet);

        const amountIn = parseEther(CONFIG.AMOUNT_TO_BUY_BNB);
        const amountOutMin = 0; // DANGEROUS: No slippage protection for speed. In prod, calculate this.
        const path = [CONFIG.WBNB_ADDRESS, tokenAddress];
        const to = wallet.address;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

        log(`Sending Buy Transaction...`, 'INFO');

        const tx = await router.swapExactETHForTokens(
            amountOutMin,
            path,
            to,
            deadline,
            {
                value: amountIn,
                gasLimit: 300000, // Estimate or set high
                gasPrice: parseUnits(CONFIG.GAS_PRICE_GWEI, 'gwei')
            }
        );

        log(`Transaction Sent: ${tx.hash}`, 'SNIPE');

        const receipt = await tx.wait();
        log(`Transaction Confirmed: Block ${receipt.blockNumber}`, 'SUCCESS');

        if (io) io.emit('trade', {
            type: 'BUY',
            token: tokenAddress,
            amount: CONFIG.AMOUNT_TO_BUY_BNB,
            hash: tx.hash,
            status: 'SUCCESS',
            time: new Date().toISOString()
        });

        positionManager.addPosition(tokenAddress, amountIn, amountIn); // Needs exact token amount ideally, using input BNB as proxy for now or fetch receipt

    } catch (error) {
        log(`Snipe Failed: ${error.message}`, 'ERROR');
        if (io) io.emit('trade', {
            type: 'BUY_FAILED',
            token: tokenAddress,
            error: error.message,
            status: 'FAILED',
            time: new Date().toISOString()
        });
    }
}

module.exports = { snipe };
