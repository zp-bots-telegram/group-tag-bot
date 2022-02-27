import { Telegraf } from 'telegraf';
import { prisma } from 'platform/db/client';

export function infoCommand(bot: Telegraf) {
  bot.command('info', async (ctx, next) => {
    const msg = ctx.message;
    const command = ctx.message.text;
    console.log(command);
    const match = /\/info ([a-z0-9]+)/i.exec(command);

    if (match?.length !== 2) {
      console.log(JSON.stringify(match));
      await ctx.reply('Usage is /info (tagName)');
      return;
    }

    if (!['supergroup', 'group'].includes(msg.chat.type)) {
      await ctx.reply("You can't use this command outside of a group chat");
      return;
    }

    const name = match[1];
    const groupId = msg.chat.id;

    const tag = await prisma.tag.findUnique({
      select: { users: true, name: true },
      where: { name_groupId: { groupId, name } },
      rejectOnNotFound: false
    });
    if (!tag) {
      await ctx.reply('Tag not found');
      return;
    }
    let message = `<b>Tag Name</b>: ${tag.name}\n`;
    message += `<b>Total Users</b>: ${tag.users.length}\n`;
    message += `<b>User List</b>:\n`;

    tag.users.forEach((user) => {
      message += `  - ${
        user.username ||
        (user.firstName ?? '' + user.lastName ?? '') ||
        user.userId
      }\n`;
    });

    await ctx.reply(message, { parse_mode: 'HTML' });

    return next();
  });
}
