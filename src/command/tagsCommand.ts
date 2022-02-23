import { Telegraf } from 'telegraf';
import { prisma } from 'platform/db/client';

export function tagsCommand(bot: Telegraf) {
  bot.command('tags', async (ctx, next) => {
    const msg = ctx.message;

    if (!['supergroup', 'group'].includes(msg.chat.type)) {
      await ctx.reply("You can't use this command outside of a group chat");
      return;
    }

    const groupId = msg.chat.id;

    const tags = await prisma.tag.findMany({
      where: { groupId },
      select: { users: true, name: true }
    });

    let message = '<b>Tags</b>\n';

    tags.forEach((tag) => {
      message += `${tag.name} - ${tag.users.length} Users\n`;
    });

    await ctx.replyWithHTML(message);
    return next();
  });
}
