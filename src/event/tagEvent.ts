import { Telegraf } from 'telegraf';
import { prisma } from 'platform/db/client';

const generateTags = (userIds: bigint[]) => {
  let tags = '';
  userIds.forEach((userId) => {
    tags += `[‎](tg://user?id=${userId})`;
  });
  return tags;
};

export function tagEvent(bot: Telegraf) {
  bot.on('text', async (ctx, next) => {
    console.log('tagEvent');
    const msg = ctx.message.text;
    const groupId = ctx.message.chat.id;

    const tagMatch = /^@([a-z0-9]*)/i.exec(msg);

    if (tagMatch?.length === 2) {
      const tagName = tagMatch[1];
      const tag = await prisma.tag.findUnique({
        select: { users: true },
        where: { name_groupId: { name: tagName, groupId } }
      });
      if (!tag) return;
      const users = tag.users.map((user) => {
        return user.userId;
      });
      await ctx.replyWithMarkdownV2('Tagging users' + generateTags(users));
    }
    return next();
  });
}
