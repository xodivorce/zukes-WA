require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

//CONFIG
const numbers = process.env.NUMBERS.split(",").map(n => n.trim());
const messages = process.env.MESSAGES.split(";").map(m => m.trim());
const rounds = parseInt(process.env.ROUNDS, 10) || 1;
const delayMs = parseInt(process.env.DELAY_MS, 10) || 2000;
const preparationMs = parseInt(process.env.PREPARATION_MS, 10) || 3000;

const client = new Client({
  authStrategy: new LocalAuth(),
});

// Show QR code
client.on("qr", (qr) => {
  console.log("⭕️ Scan this QR from WhatsApp < Linked Devices.");
  qrcode.generate(qr, { small: true });
});

// Serving Logic
client.on("ready", async () => {
  console.log("⚡️ The WhatsApp client is connected!");

  // Preparation Logic
  let remaining = Math.ceil(preparationMs / 1000);
  const countdown = setInterval(() => {
    process.stdout.write(`\r⏳ Starting in ${remaining--}s...   `);
    if (remaining < 0) {
      clearInterval(countdown);
      console.log("\n🚀 Let's go 💀..!");
    }
  }, 1000);

  await new Promise(r => setTimeout(r, preparationMs));

  // The main loop
  for (const number of numbers) {
    const chatId = `${number}@c.us`;

    for (let round = 1; round <= rounds; round++) {
      for (let m = 0; m < messages.length; m++) {
        try {
          await client.sendMessage(chatId, messages[m]);
          console.log(
            `📩 Sent to ${number}: "${messages[m]}" (round ${round}/${rounds}, msg ${m + 1}/${messages.length})`
          );
        } catch (err) {
          console.error(`❌ Failed to send to ${number}: "${messages[m]}" — ${err.message}`);
        }

        if (m < messages.length - 1) {
          await new Promise(r => setTimeout(r, delayMs));
        }
      }
    }
  }

  console.log("⚡️ The job finished successfully!");
});

// Termination Logic
process.on("SIGINT", () => {
  console.log("\n❗️ Terminating, exiting the WhatsApp client...");
  client.destroy();
  process.exit(0);
});

client.initialize();
