import { Bot, session } from 'grammy'
import { conversations, createConversation } from '@grammyjs/conversations'
import { deleteSub, updateSub, createUserAndSub } from './bot_admin/conversations.js'
import main from './bot_admin/menus.js'
import { deleteMsg, deleteMsgTime } from './bot_admin/functions.js'

const allowedUsers = [378931386, 6497786721, 680679144, 6653006609, 6864085986]

const bot = new Bot(process.env.BOT_ADMIN)
// bot.api.setMyCommands([{ command: 'start', description: 'Admin panel' } ])

bot.on('message', (ctx, next) => {
	if (!allowedUsers.includes(ctx.from.id)) return;
	if (ctx.msg.text === '/start') {
		deleteMsgTime(ctx, ctx.message.chat.id, ctx.message.message_id, 60_000);
		return next();
	} 
	deleteMsg(ctx, ctx.from.id, ctx.message.message_id);
	next();
})

bot.use(session({ initial: () => ({ init: 0 }) }));
bot.use(conversations());
bot.use(createConversation(createUserAndSub));
bot.use(createConversation(deleteSub));
bot.use(createConversation(updateSub));
bot.use(main)

bot.command('start', async ctx => {
    await ctx.reply("Admin panel",{
		reply_markup: main,
	});
})

bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e.description) {
	  console.error("Error in request:", e.description);
	} else {
	  console.error("Unknown error:", e);
	}
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start()