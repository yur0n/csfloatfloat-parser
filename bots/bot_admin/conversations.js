import { Sub, User } from '../../src/models/models.js'
import { InlineKeyboard } from 'grammy'
import { replyAndDel, deleteMsg, deleteMsgTime } from './functions.js'

const setSubTime = (days) => {
	days = Math.min(Math.max(days, 1), 10000)
	return new Date(Date.now() + (days * 24 * 3600 * 1000))
}

function hash(buyerIndex, productCode) {
	function char() {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ()abcdefghijklmnopqrstuvwxyz';
		return chars[Math.floor(Math.random() * chars.length)];
	}

  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const rawCode = `${productCode}${char()}${year}${char()}${month}${char()}${day}${char()}${buyerIndex}`;
  const hash = Math.floor(Math.random() * 104729);
  return `${rawCode}${char()}${hash}`;
}


export async function createUserAndSub(conversation, ctx) {
	try {
		let ask = await ctx.reply('⌨️ Enter product code', {
			reply_markup: new InlineKeyboard().text('🚫 Cancel')
		});
		ctx = await conversation.wait();
		deleteMsg(ctx, ask.chat.id, ask.message_id)
		if (ctx.update.callback_query?.data) return
		const productCode = ctx.msg.text;
		const lastBuyer = await User.findOne({}).sort({_id: -1});
		const index = lastBuyer ? lastBuyer._id + 1 : 1;
		const code = hash(index, productCode);
		await User.create({ _id: index, code });
		await Sub.create({ _id: index, code, expirationDate: setSubTime(30) });
		ctx.reply(`Generated code: ${code}\nUser index: ${index}`);
	} catch (error) {
		console.log('Bot admin error:', error)
	}
}

export async function deleteSub(conversation, ctx) {
	try {
		let ask = await ctx.reply('⌨️ Enter user index', {
			reply_markup: new InlineKeyboard().text('🚫 Cancel')
		});
		ctx = await conversation.wait();
		deleteMsg(ctx, ask.chat.id, ask.message_id)
		if (ctx.update.callback_query?.data) return
		let id = ctx.msg.text;
		let subscriber = await Sub.findById(id)
		if (subscriber) {
			await subscriber.deleteOne()
			replyAndDel(ctx, `✅ User ${id} subscription deleted`)
		} else {
			replyAndDel(ctx, `ℹ️ User ${id} subscription not found`)
		}
	} catch (error) {
		console.log('Bot admin error:', error)
		replyAndDel(ctx, `Database error`)
	}
}

export async function updateSub(conversation, ctx) {
	try {
		let ask = await ctx.reply('⌨️ Enter user index', {
			reply_markup: new InlineKeyboard().text('🚫 Cancel')
		});
		ctx = await conversation.wait();
		deleteMsg(ctx, ask.chat.id, ask.message_id)
		if (ctx.update.callback_query?.data) return
		const id = ctx.msg.text;
		const user = await User.findById(id)
		if (user) {
			const subscriber = await Sub.findById(user._id)
			if (!subscriber) {
				await Sub.create({ _id: user._id, code: user.code, expirationDate: setSubTime(30) });
				replyAndDel(ctx, `✅ User ${id} subscription updated`)
				return
			}
			let newTtl = new Date (subscriber.expirationDate.getTime() + (30 * 24 * 3600 * 1000))
			await subscriber.updateOne({ expirationDate: newTtl })
			replyAndDel(ctx, `✅ User ${id} subscription updated`)
		} else {
			replyAndDel(ctx, `ℹ️ User ${id} not found`)
		}
	} catch (error) {
		console.log('Bot admin error:', error)
		replyAndDel(ctx, `Database error`)
	}
}