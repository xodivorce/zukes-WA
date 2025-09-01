require("dotenv").config();
const venom = require("venom-bot");

// CONFIG
const numbers = process.env.NUMBERS.split(",").map(n => n.trim());
const messages = process.env.MESSAGES.split(";").map(m => m.trim());
const rounds = parseInt(process.env.ROUNDS, 10) || 1;
const delayMs = parseInt(process.env.DELAY_MS, 10) || 2000;
const preparationMs = parseInt(process.env.PREPARATION_MS, 10) || 3000;

// Initialize venom-bot headless
venom
  .create({
    session: 'zukes-session',
    multidevice: true,
    headless: 'new'
  })
  .then(client => start(client))
  .catch(err => console.error(err));

async function start(client) {
  console.log("⚡️ WhatsApp client connected!");

  // Preparation countdown
  let remaining = Math.ceil(preparationMs / 1000);
  const countdown = setInterval(() => {
    process.stdout.write(`\r⏳ Starting in ${remaining--}s...   `);
    if (remaining < 0) {
      clearInterval(countdown);
      console.log("\n🚀 Let's go 💀..!");
    }
  }, 1000);

  await new Promise(r => setTimeout(r, preparationMs));

  // Main message loop
  for (const number of numbers) {
    const chatId = `${number}@c.us`;

    for (let round = 1; round <= rounds; round++) {
      for (let m = 0; m < messages.length; m++) {
        try {
          await client.sendText(chatId, messages[m]);
          console.log(`📩 Sent to ${number}: "${messages[m]}" (round ${round}/${rounds}, msg ${m + 1}/${messages.length})`);

          // Wait after each message
          let wait = Math.ceil(delayMs / 1000);
          const waitTimer = setInterval(() => {
            process.stdout.write(`\r⏳ Waiting ${wait--}s...   `);
            if (wait < 0) {
              clearInterval(waitTimer);
              process.stdout.write("\r🚀 Next message...\n");
            }
          }, 1000);

          await new Promise(r => setTimeout(r, delayMs));

        } catch (err) {
          console.error(`❌ Failed to send to ${number}: "${messages[m]}" — ${err.message}`);
        }
      }
    }
  }

  console.log("⚡️ The job finished successfully!");
}

// Termination handling
process.on("SIGINT", () => {
  console.log("\n❗️ Terminating, exiting the WhatsApp client...");
  process.exit(0);
});
