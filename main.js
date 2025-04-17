import dotenv from 'dotenv';
import fs from 'fs';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { exec } from 'child_process';
import ora from 'ora';
import inquirer from 'inquirer';

dotenv.config();

function banner() {
  console.clear();
  const title = figlet.textSync('APRMON', { horizontalLayout: 'default' });
  console.log(gradient.pastel.multiline(title));
  console.log(chalk.greenBright.bold('\n🔥 APRMON DAILY OPS | HOKIRECEH NGGASPOL 🔥\n'));
}

async function askMenu() {
  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: chalk.magenta('📥 Pilih menu bos:'),
      choices: [
        { name: '🥩 Stake Harian', value: '1' },
        { name: '📤 Request Unstake Harian', value: '2' },
        { name: '🔄 Redeem yang Udah Bisa', value: '3' },
        { name: '📄 Cek Status Request', value: '4' },
        { name: '🕒 Auto Stake Harian (jam 7 pagi)', value: '5' },
        { name: '❌ METU WAE COK', value: '0' }
      ]
    }
  ]);

  switch (choice) {
    case '1': runScript('./scripts/stake.js'); break;
    case '2': runScript('./scripts/requestUnstake.js'); break;
    case '3': runScript('./scripts/redeem.js'); break;
    case '4': checkRequestStatus(); break;
    case '5': autoDailyStake(); break;
    case '0':
      console.log(chalk.redBright('\n👋 Wes cuk, METU!')); process.exit(0);
  }
}

function runScript(scriptPath) {
  const spinner = ora(`🚀 Lagi mlaku ${scriptPath}...`).start();
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    spinner.stop();
    if (stdout) console.log(chalk.white(stdout));
    if (error) console.error(chalk.red(`❌ ERROR COK: ${error.message}`));
    if (stderr) console.error(chalk.red(stderr));
    kembaliMenu();
  });
}

async function kembaliMenu() {
  console.log(chalk.gray('\n🌀 Balik ke menu utama...\n'));
  await new Promise(resolve => setTimeout(resolve, 1000));
  start();
}

function checkRequestStatus() {
  try {
    const data = fs.readFileSync('requestId.txt', 'utf8');
    const ids = data.split('\n').filter(Boolean);
    if (ids.length === 0) {
      console.log(chalk.red('📭 Kosong cuk! Durung ana requestId.'));
    } else {
      console.log(chalk.greenBright('\n📌 Daftar RequestID mu bos:'));
      ids.forEach((id, i) => {
        console.log(`${chalk.green(i + 1)}. ${chalk.white(id)}`);
      });
    }
  } catch (err) {
    console.error(chalk.red('❌ Gagal maca file requestId.txt, jancuk.'));
  }
  kembaliMenu();
}

function autoDailyStake() {
  console.log(chalk.cyanBright('🕒 Auto-Stake Harian AKTIF! Sekali sehari pas jam tertentu\n'));
  console.log(chalk.gray('📌 Tekan CTRL + C nek arep METU menyang menu utama.\n'));

  const targetHour = 7;
  const targetMinute = 0;

  const loop = async () => {
    const now = new Date();
    const next = new Date();
    next.setHours(targetHour, targetMinute, 0, 0);
    if (now >= next) next.setDate(now.getDate() + 1);

    const msUntilNext = next - now;

    console.log(chalk.greenBright(`⏰ Jadwal stake berikutnya: ${next.toLocaleString()} (${Math.round(msUntilNext / 1000)} detik lagi)`));

    setTimeout(() => {
      runScript('./scripts/stake.js');
      loop();
    }, msUntilNext);
  };

  process.on('SIGINT', () => {
    console.log(chalk.redBright('\n\n🛑 Auto-Stake Harian dibatalkan. Balik ke menu...\n'));
    setTimeout(() => start(), 1000);
  });

  loop();
}

function start() {
  banner();
  askMenu();
}

start();
