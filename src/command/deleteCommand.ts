import { Telegraf } from 'telegraf';
import { prisma } from 'platform/db/client';
import { Prisma } from '@prisma/client/generated';
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export function deleteCommand(bot: Telegraf) {
  bot.command('delete', async (ctx, next) => {
    const msg = ctx.message;
    const command = ctx.message.text;
    console.log(command);
    const match = /\/delete ([a-z0-9]+)/i.exec(command);

    if (match?.length !== 2) {
      console.log(JSON.stringify(match));
      await ctx.reply('Usage is /delete (tagName)');
      return;
    }

    if (!['supergroup', 'group'].includes(msg.chat.type)) {
      await ctx.reply("You can't use this command outside of a group chat");
      return;
    }

    const name = match[1];
    const groupId = msg.chat.id;

    try {
      await prisma.tag.delete({
        where: { name_groupId: { name, groupId } }
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        console.log(e.code);
        if (e.code === 'P2025') {
          await ctx.reply(`Tag @${name} doesn't exist`);
          return;
        }
      }
      throw e;
    }
    await ctx.replyWithHTML('<b>Tag Deleted</b>');
    return next();
  });
}
