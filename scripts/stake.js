require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const abi = JSON.parse(fs.readFileSync('./abi/aprMON.json'));
const contract = new ethers.Contract(process.env.APRMON_CONTRACT, abi, wallet);

async function stake() {
  const amount = ethers.parseUnits(process.env.AMOUNT, 18);
  const assetAddress = await contract.asset();
  console.log(`🪙 Token yang digunakan untuk staking: ${assetAddress}`);

  if (assetAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    console.log(`💸 Native token terdeteksi, mengirim ${process.env.AMOUNT} TEA...`);
    const tx = await contract.deposit(amount, wallet.address, { value: amount });
    console.log(`🚀 TX terkirim: ${tx.hash}`);
    await tx.wait();
    console.log('✅ Staking selesai (native token)');
  } else {
    console.log(`🧾 Token ERC-20 terdeteksi, cek allowance...`);
    const erc20Abi = [
      'function allowance(address owner, address spender) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)'
    ];
    const token = new ethers.Contract(assetAddress, erc20Abi, wallet);
    const allowance = await token.allowance(wallet.address, contract.address);

    if (allowance < amount) {
      console.log(`🔐 Approving ${process.env.AMOUNT} token...`);
      const txApprove = await token.approve(contract.address, ethers.MaxUint256);
      await txApprove.wait();
      console.log('✅ Token approved!');
    }

    console.log(`📤 Staking token ${process.env.AMOUNT}...`);
    const tx = await contract.deposit(amount, wallet.address);
    console.log(`🚀 TX terkirim: ${tx.hash}`);
    await tx.wait();
    console.log('✅ Staking selesai (ERC-20)');
  }
}

stake().catch((err) => {
  console.error('❌ Error:', err);
});
