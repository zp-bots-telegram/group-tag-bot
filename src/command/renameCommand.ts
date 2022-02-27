import { Telegraf } from 'telegraf';
import { prisma } from 'platform/db/client';
import { Prisma } from '@prisma/client/generated';
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export function renameCommand(bot: Telegraf) {
  bot.command('rename', async (ctx, next) => {
    const msg = ctx.message;
    const command = ctx.message.text;
    console.log(command);
    const match = /\/rename ([a-z0-9]+) ([a-z0-9]+)/i.exec(command);

    if (match?.length !== 3) {
      console.log(JSON.stringify(match));
      await ctx.reply('Usage is /rename (oldTagName) (newTagName)');
      return;
    }

    if (!['supergroup', 'group'].includes(msg.chat.type)) {
      await ctx.reply("You can't use this command outside of a group chat");
      return;
    }

    const name = match[1];
    const newName = match[2];
    const groupId = msg.chat.id;

    try {
      await prisma.tag.update({
        where: { name_groupId: { name, groupId } },
        data: { name: newName }
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          await ctx.reply(`Tag @${name} doesn't exist`);
          return;
        }
        if (e.code === 'P2002') {
          await ctx.reply(`Tag @${newName} already exists, rename failed`);
          return;
        }
      }
      throw e;
    }
    await ctx.replyWithHTML('<b>Tag Renamed</b>');
    return next();
  });
}
