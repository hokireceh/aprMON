import dotenv from 'dotenv';
import fs from 'fs';
import { ethers } from 'ethers';
import abi from '../abi/aprMON.json' assert { type: 'json' };

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.APRMON_CONTRACT, abi, wallet);

async function redeemFromFile() {
  const path = 'requestId.txt';

  if (!fs.existsSync(path)) {
    console.log('📭 Tidak ada file requestId.txt');
    process.exit(0);
  }

  const ids = fs.readFileSync(path, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    console.log('📭 File requestId.txt kosong.');
    process.exit(0);
  }

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
        console.log(`⏳ Belum bisa redeem ${id}, tunggu maneh...`);
        remaining.push(id);
      }
    } catch (err) {
      console.error(`❌ Error redeem ID ${id}: ${err.message || err}`);
      remaining.push(id);
    }
  }

  fs.writeFileSync(path, remaining.join('\n'));
  console.log(`📝 requestId.txt diupdate, tersisa: ${remaining.length}`);
}

redeemFromFile().catch((err) => {
  console.error('❌ ERROR UTAMA:', err.message || err);
  process.exit(1);
});
