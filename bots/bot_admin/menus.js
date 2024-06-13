import { Menu } from "@grammyjs/menu"

const main = new Menu('main-menu')
	.text('➕ Generate code', async ctx => {
		await ctx.conversation.enter('createUserAndSub')
	}).row()
	.text('❌ Delete subscription by user index', async ctx => {
		await ctx.conversation.enter('deleteSub')
	}).row()
    .text('✏️ Update subscription by user index', async ctx => {
		await ctx.conversation.enter('updateSub')
	})

export default main
