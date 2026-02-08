const { Contract, parseUnits } = require('ethers');
const CONFIG = require('./config');
const { log } = require('./utils');

let positions = [];
let provider;
let wallet;
let io;

function init(pProvider, pWallet, pIo) {
    provider = pProvider;
    wallet = pWallet;
    io = pIo;

    // Start monitoring loop
    setInterval(monitorPositions, CONFIG.SELL_CHECK_INTERVAL_MS);
}

function addPosition(tokenAddress, amountTokens, initialCostBNB) {
    log(`Tracking new position: ${tokenAddress}`, 'INFO');
    positions.push({
        token: tokenAddress,
        amount: amountTokens,
        cost: initialCostBNB,
        timestamp: Date.now()
    });
}

async function monitorPositions() {
    if (positions.length === 0) return;

    const routerAbi = [
        "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
        "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ];
    // In simulation mode, we just use a read-only provider for checking prices if possible, 
    // but for selling we need a wallet.
    const router = new Contract(CONFIG.ROUTER_ADDRESS, routerAbi, wallet || provider);

    for (let i = positions.length - 1; i >= 0; i--) {
        const pos = positions[i];

        try {
            // Check current value in BNB
            const path = [pos.token, CONFIG.WBNB_ADDRESS];
            const amounts = await router.getAmountsOut(pos.amount, path);
            const currentValueBNB = amounts[1]; // define as BigInt in v6 usually, but let's compare

            // Calculate Ratio
            // We need to be careful with BigInt math in v6 or BigNumber in v5. 
            // ethers v6 uses Native BigInt.

            // Simple string comparison for Simulation logs
            const currentEth = Number(ethers.formatEther(currentValueBNB));
            const costEth = Number(ethers.formatEther(pos.cost));
            const ratio = currentEth / costEth;

            if (ratio >= CONFIG.TAKE_PROFIT_MULTIPLIER) {
                await sell(pos, 'TAKE_PROFIT', currentValueBNB);
                positions.splice(i, 1);
            } else if (ratio <= CONFIG.STOP_LOSS_MULTIPLIER) {
                await sell(pos, 'STOP_LOSS', currentValueBNB);
                positions.splice(i, 1);
            }

        } catch (error) {
            // Price check failed (maybe no liquidity yet)
            // log(`Price check failed for ${pos.token}: ${error.message.substring(0, 50)}...`, 'WARNING');
        }
    }

    // Broadcast positions update
    if (io) {
        const simplifiedPositions = positions.map(p => ({
            token: p.token,
            cost: ethers.formatEther(p.cost),
            profit: 0 // Calculate real profit here if possible, for now 0
        }));
        io.emit('positions', simplifiedPositions);
    }
}

async function sell(position, reason, valueBNB) {
    const reasonMsg = reason === 'TAKE_PROFIT' ? '💰 Take Profit' : '🛑 Stop Loss';
    log(`${reasonMsg} triggered for ${position.token}. Value: ${ethers.formatEther(valueBNB)} BNB`, 'SNIPE');

    if (CONFIG.SIMULATION_MODE) {
        log(`[SIMULATION] Sold ${position.token} (${reason})`, 'SUCCESS');
        if (io) io.emit('trade', {
            type: `SELL (${reason})`,
            token: position.token,
            amount: ethers.formatEther(valueBNB),
            status: 'SUCCESS',
            time: new Date().toISOString()
        });
        return;
    }

    // REAL SELL LOGIC
    try {
        const router = new Contract(CONFIG.ROUTER_ADDRESS,
            ["function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external"],
            wallet
        );

        // Approve first? (Usually needed, skipping for brevity but MUST be added for real bot)
        // For sniper bots, usually you approve on buy or use a bot contract. 
        // Standard flow: Approve -> Swap.

        // ... Assuming approval is done or we add it here ...
        const tokenAbi = ["function approve(address spender, uint amount) external returns (bool)"];
        const tokenContract = new Contract(position.token, tokenAbi, wallet);
        await (await tokenContract.approve(CONFIG.ROUTER_ADDRESS, position.amount)).wait();

        const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            position.amount,
            0, // accept any amount for now (slippage risk)
            [position.token, CONFIG.WBNB_ADDRESS],
            wallet.address,
            Math.floor(Date.now() / 1000) + 600
        );

        await tx.wait();
        log(`Sold ${position.token}! Hash: ${tx.hash}`, 'SUCCESS');

        if (io) io.emit('trade', {
            type: 'SELL',
            token: position.token,
            hash: tx.hash,
            status: 'SUCCESS',
            time: new Date().toISOString()
        });

    } catch (e) {
        log(`Sell failed: ${e.message}`, 'ERROR');
    }
}

const ethers = require('ethers'); // helper for formatEther
module.exports = { init, addPosition };
