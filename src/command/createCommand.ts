import { Telegraf } from 'telegraf';
import { prisma } from 'platform/db/client';
import { Prisma } from '@prisma/client/generated';
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export function createCommand(bot: Telegraf) {
  bot.command('create', async (ctx, next) => {
    const msg = ctx.message;
    const command = ctx.message.text;
    console.log(command);
    const match = /\/create ([a-z0-9]+)/i.exec(command);

    if (match?.length !== 2) {
      console.log(JSON.stringify(match));
      await ctx.reply('Usage is /create (tagName)');
      return;
    }

    if (!['supergroup', 'group'].includes(msg.chat.type)) {
      await ctx.reply("You can't use this command outside of a group chat");
      return;
    }

    const name = match[1];
    const groupId = msg.chat.id;

    try {
      await prisma.group.upsert({
        where: { groupId },
        update: { tags: { create: [{ name }] } },
        create: { groupId, tags: { create: [{ name }] } }
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          await ctx.reply(`Tag @${name} already exists`);
          return;
        }
      }
    }
    await ctx.replyWithHTML('<b>Tag Created</b>');
    return next();
  });
}
