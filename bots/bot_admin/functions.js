export async function deleteMsg(ctx, chat, msg) {
	try {
		await ctx.api.deleteMessage(chat, msg)
	} catch (e) {}
}

export async function deleteMsgTime(ctx, chat, msg, time = 2500) {
	await new Promise(resolve => setTimeout(resolve, time))
	try {
		await ctx.api.deleteMessage(chat, msg)
	} catch (e) {}
}

export async function replyAndDel(ctx, text, time = 2500) {
	const msg = await ctx.reply(text)
	await new Promise(resolve => setTimeout(resolve, time))
	try {
		await ctx.api.deleteMessage(msg.chat.id, msg.message_id)
	} catch (e) {}
}