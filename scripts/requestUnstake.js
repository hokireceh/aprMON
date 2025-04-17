// scripts/requestUnstake.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const abi = require('../abi/aprMON.json');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.APRMON_CONTRACT, abi, wallet);

async function requestUnstake() {
  const amount = ethers.parseUnits(process.env.AMOUNT, 18);
  const tx = await contract.requestRedeem(amount, wallet.address, wallet.address);
  console.log(`📤 Request redeem dikirim: ${tx.hash}`);
  await tx.wait();

  const nextId = await contract.nextRequestId();
  const requestId = nextId - 1n;

  // Simpan ke file
  fs.appendFileSync('requestId.txt', `${requestId.toString()}\n`);
  console.log(`✅ requestId disimpan: ${requestId}`);
}

requestUnstake().catch(console.error);

