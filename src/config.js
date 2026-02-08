require('dotenv').config();

const CONFIG = {
    // Default to BSC (Binance Smart Chain)
    RPC_URL: process.env.RPC_URL || 'https://bsc-dataseed.binance.org/',

    // PancakeSwap V2 Router & Factory
    ROUTER_ADDRESS: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    FACTORY_ADDRESS: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',

    // Token to snipe with (WBNB)
    WBNB_ADDRESS: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',

    // Snipe Settings
    AMOUNT_TO_BUY_BNB: '0.01', // Amount of BNB to spend per snipe
    SLIPPAGE: 10, // 10% Slippage
    GAS_PRICE_GWEI: '5',

    // Safety
    SIMULATION_MODE: process.env.SIMULATION_MODE === 'true',
    MIN_LIQUIDITY_BNB: 1, // Minimum liquidity to consider sniping (to avoid absolute junk)

    // Auto-Sell Strategy
    TAKE_PROFIT_MULTIPLIER: 2.0, // Sell at 2x price (100% profit)
    STOP_LOSS_MULTIPLIER: 0.5,   // Sell at 0.5x price (50% loss)
    SELL_CHECK_INTERVAL_MS: 5000 // Check price every 5 seconds
};

module.exports = CONFIG;
