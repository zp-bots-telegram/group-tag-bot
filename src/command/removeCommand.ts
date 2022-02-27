import { Telegraf } from 'telegraf';
import { prisma } from 'platform/db/client';
import { MessageEntity } from 'telegraf/typings/core/types/typegram';

export function removeCommand(bot: Telegraf) {
  bot.command('remove', async (ctx, next) => {
    const msg = ctx.message;
    const command = msg.text;
    const match = /\/remove ([a-z0-9]+) (.*)/i.exec(command);

    if (match?.length !== 3) {
      console.log(JSON.stringify(match));
      await ctx.reply('Usage is /remove (tagName) (username1) (username2)...');
      return;
    }

    if (!['supergroup', 'group'].includes(msg.chat.type)) {
      await ctx.reply("You can't use this command outside of a group chat");
      return;
    }

    const mentions = ctx.message.entities?.filter((entity) => {
      if (entity.type === 'mention') return true;
    });

    const textMentions = ctx.message.entities?.filter(
      (entity): entity is MessageEntity.TextMentionMessageEntity => {
        return entity.type === 'text_mention';
      }
    );

    if (!mentions && !textMentions) {
      await ctx.reply('Usage is /remove (tagName) (username1) (username2)...');
      return;
    }

    const usernames = mentions?.map((mention) => {
      const { offset, length } = mention;
      return command.substring(offset + 1, offset + length);
    });

    const users: { userId: number | bigint }[] = [];
    const textMentionUsers = textMentions?.map((textMention) => {
      return { userId: textMention.user.id };
    });
    if (textMentionUsers) {
      users.push(...textMentionUsers);
    }

    const name = match[1];
    const groupId = msg.chat.id;

    const usernameUsers = await prisma.user.findMany({
      where: { username: { in: usernames } }
    });

    const usernameUserIds = usernameUsers.map((user) => {
      return { userId: user.userId };
    });
    users.push(...usernameUserIds);

    await prisma.tag.update({
      where: { name_groupId: { name, groupId } },
      data: { users: { disconnect: users } }
    });

    const message = `<b>${users.length} users removed from tag</b>\n`;

    await ctx.replyWithHTML(message);
    return next();
  });
}
