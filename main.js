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
  const title = figlet.textSync('HOKI-RECEH', { horizontalLayout: 'default' });
  console.log(gradient.pastel.multiline(title));
  console.log(chalk.greenBright.bold('\n🔥 APRMON DAILY OPS | OJO DI COPAS COK 🔥\n'));
}

async function askMenu() {
  try {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: chalk.magenta('📥 Pilih menu mu, JANCOK:'),
        choices: [
          { name: '🥩 Staking sak arepmu COK', value: '1' },
          { name: '📤 Arep narik? Request Unstake sek', value: '2' },
          { name: '🔄 Redeem MON nek wes iso', value: '3' },
          { name: '📄 Delok RequestID sing isih nyantol', value: '4' },
          { name: '🕒 Auto Stake saben esuk (jam 7)', value: '5' },
          { name: '❌ METU WAE, MBUANG WAKTU COK', value: '0' }
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
        console.log(chalk.redBright('\n👋 METU SEK, RA USAH NGANGGU COK!'));
        process.exit(0);
    }

  } catch (err) {
    if (err.isTtyError || err.message?.includes('User force closed the prompt')) {
      console.log(chalk.redBright('\n❌ DITUTUP PAKSA COK — METU KABEH!'));
      process.exit(0);
    } else {
      console.error(chalk.red('❌ ERROR INQUIRER, COK:'), err);
      process.exit(1);
    }
  }
}

function runScript(scriptPath) {
  const spinner = ora(`🚀 MLK script: ${scriptPath}...`).start();
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    spinner.stop();
    if (stdout) console.log(chalk.white(stdout));
    if (error) console.error(chalk.red(`❌ ERROR NYA COK: ${error.message}`));
    if (stderr) console.error(chalk.red(stderr));
    kembaliMenu();
  });
}

async function kembaliMenu() {
  console.log(chalk.gray('\n🌀 Balik meneh neng menu, jancok...\n'));
  await new Promise(resolve => setTimeout(resolve, 1000));
  start();
}

function checkRequestStatus() {
  try {
    const data = fs.readFileSync('requestId.txt', 'utf8');
    const ids = data.split('\n').filter(Boolean);
    if (ids.length === 0) {
      console.log(chalk.red('📭 SEPI BOS! Durung ana sing ngajuin request.'));
    } else {
      console.log(chalk.greenBright('\n📌 RequestID sing isih nyantol cuk:'));
      ids.forEach((id, i) => {
        console.log(`${chalk.green(i + 1)}. ${chalk.white(id)}`);
      });
    }
  } catch (err) {
    console.error(chalk.red('❌ Gagal maca file requestId.txt, COK RA MAMPIR.'));
  }
  kembaliMenu();
}

function autoDailyStake() {
  console.log(chalk.cyanBright('🕒 AUTO STAKE SAK JAM 7 WIB COK, SEKALI SEDINO!'));
  console.log(chalk.gray('📌 Pencet CTRL + C nek ra gelem nunggu...'));

  const targetHour = 7;
  const targetMinute = 0;

  const loop = async () => {
    const now = new Date();
    const next = new Date();
    next.setHours(targetHour, targetMinute, 0, 0);
    if (now >= next) next.setDate(now.getDate() + 1);

    const msUntilNext = next - now;

    console.log(chalk.greenBright(`⏰ Bakal stake jam: ${next.toLocaleString()} (${Math.round(msUntilNext / 1000)} detik maneh)`));

    setTimeout(() => {
      runScript('./scripts/stake.js');
      loop();
    }, msUntilNext);
  };

  process.on('SIGINT', () => {
    console.log(chalk.redBright('\n\n🛑 Wes tak batalno, ojok ndangak tok nang terminal. Balik neng menu...\n'));
    setTimeout(() => start(), 1000);
  });

  loop();
}

function start() {
  banner();
  askMenu();
}

start();
