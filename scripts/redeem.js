// scripts/redeem.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const abi = require('../abi/aprMON.json');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.APRMON_CONTRACT, abi, wallet);

async function redeemFromFile() {
  const path = 'requestId.txt';
  if (!fs.existsSync(path)) {
    console.log('📭 Tidak ada requestId disimpan.');
    return;
  }

  const ids = fs.readFileSync(path, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  const remaining = [];

  for (const id of ids) {
    try {
      const claimable = await contract.claimableRedeemRequest(BigInt(id), wallet.address);
      if (claimable > 0n) {
        console.log(`✅ Redeeming requestId ${id}...`);
        const tx = await contract.redeem(BigInt(id), wallet.address);
        console.log(`🚀 TX redeem sent: ${tx.hash}`);
        await tx.wait();
        console.log(`🎉 Sukses redeem requestId ${id}`);
      } else {
        console.log(`⏳ Belum bisa redeem ${id}, tunggu lagi...`);
        remaining.push(id);
      }
    } catch (err) {
      console.error(`❌ Error redeem ID ${id}: ${err.message}`);
      remaining.push(id);
    }
  }

  fs.writeFileSync(path, remaining.join('\n'));
  console.log(`📝 Update requestId.txt, tersisa: ${remaining.length}`);
}

redeemFromFile();
