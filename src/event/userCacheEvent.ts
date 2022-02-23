import { Telegraf } from 'telegraf';
import { prisma } from 'platform/db/client';

export function userCacheEvent(bot: Telegraf) {
  bot.use(async (ctx, next) => {
    console.log('userCacheEvent');
    if (!ctx.from || !ctx.message) {
      return next();
    }
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const groupId = ctx.message.chat.id;

    await prisma.user.upsert({
      where: { userId },
      update: {
        username,
        lastSeen: new Date(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        groups: {
          upsert: [{ where: { groupId }, create: { groupId }, update: {} }]
        }
      },
      create: {
        userId,
        username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        groups: {
          connectOrCreate: [{ where: { groupId }, create: { groupId } }]
        }
      }
    });
    return next();
  });
}
