import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';

import abi from '../abi/aprMON.json' assert { type: 'json' };

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.APRMON_CONTRACT, abi, wallet);

async function requestUnstake() {
  try {
    if (!process.env.AMOUNT || isNaN(process.env.AMOUNT)) {
      throw new Error('❌ Nilai AMOUNT di .env tidak valid atau kosong!');
    }

    const amount = ethers.parseUnits(process.env.AMOUNT, 18);
    console.log(`🔁 Mengirim request redeem sebesar ${process.env.AMOUNT} token...`);

    const tx = await contract.requestRedeem(amount, wallet.address, wallet.address);
    console.log(`📤 Request redeem dikirim: ${tx.hash}`);
    await tx.wait();

    const nextId = await contract.nextRequestId();
    const requestId = nextId - 1n;

    fs.appendFileSync('requestId.txt', `${requestId.toString()}\n`);
    console.log(`✅ requestId disimpan: ${requestId}`);
  } catch (err) {
    console.error('❌ ERROR REQUEST UNSTAKE:', err.message || err);
    process.exit(1); // biar keluar error code
  }
}

requestUnstake();
