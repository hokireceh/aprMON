// scripts/stake.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abi = JSON.parse(fs.readFileSync('./abi/aprMON.json'));
const contract = new ethers.Contract(process.env.APRMON_CONTRACT, abi, wallet);

async function stake() {
  const amount = ethers.parseUnits(process.env.AMOUNT, 18);
  const tx = await contract.deposit(amount, wallet.address);
  console.log(`Staking TX sent: ${tx.hash}`);
  await tx.wait();
  console.log('✅ Staking completed!');
}

stake().catch(console.error);
