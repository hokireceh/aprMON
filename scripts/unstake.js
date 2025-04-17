// scripts/unstake.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abi = JSON.parse(fs.readFileSync('./abi/aprMON.json'));
const contract = new ethers.Contract(process.env.APRMON_CONTRACT, abi, wallet);

async function unstake() {
  const shares = await contract.balanceOf(wallet.address);
  console.log(`🔹 Total Shares (aprMON): ${ethers.formatUnits(shares, 18)}`);

  const assets = await contract.convertToAssets(shares);
  console.log(`💰 Estimasi TEA yang bisa di-redeem: ${ethers.formatUnits(assets, 18)}`);

  // OPTIONAL: Jika kontrak ada fungsi redeem/withdraw, tambahkan logic tx-nya di sini

  console.log('ℹ️ Unstaking via redeem belum tersedia di kontrak. Silakan cek fitur baru nanti.');
}

unstake().catch(console.error);
