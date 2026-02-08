console.log('Starting debug...');
try {
    const ethers = require('ethers');
    console.log('Ethers loaded:', !!ethers);

    require('dotenv').config();
    console.log('Dotenv loaded');

    const config = require('./src/config');
    console.log('Config loaded');

    const utils = require('./src/utils');
    console.log('Utils loaded');

    const server = require('./src/server');
    console.log('Server loaded');

    const scanner = require('./src/scanner');
    console.log('Scanner loaded');

    const sniper = require('./src/sniper');
    console.log('Sniper loaded');

} catch (e) {
    console.error('Debug Error:', e);
}
