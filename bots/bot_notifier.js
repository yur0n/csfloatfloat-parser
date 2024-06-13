import { Bot } from 'grammy'

const bot = new Bot(process.env.BOT_NOTIFIER)
// bot.api.setMyCommands([{ command: 'start', description: 'Start bot' } ])

bot.command('start', async (ctx) => {
	await ctx.reply('Hello, I will be sending you notifications about new profitable skins\n\n' + 
									'To enable notifications, enter your Telegram ID on the website\n' +
									'To disable notifications, simply clear the Telegram ID field')
	await ctx.reply('Your Telegram ID: ' + ctx.message.chat.id)
})

bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	// if (e instanceof GrammyError) {
	if (e.description) {
	  console.error("Error in request:", e.description);
	// } else if (e instanceof HttpError) {
	//   console.error("Could not contact Telegram:", e);
	} else {
	  console.error("Unknown error:", e);
	}
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start()

export default async (skins, chatId) => {
	try {
		if (!skins.length) return;
		for (const skin of skins) {
			let message = `
				${skin.name}
				\nCSFloat Price: ${skin.csPrice}
				\nBUFF163 Price: ${skin.buffPrice}
				\nProfit: ${skin.profit}%
				`;
			await bot.api.sendPhoto(chatId, skin.photo, {
				caption: message,
				reply_markup: {
					inline_keyboard: [
						[{ text: 'СSFloat Link', url: skin.link }]
					]
				}
			});
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
	} catch (e) {}
}