import { Telegraf } from 'telegraf';
import { userCacheEvent } from 'event/userCacheEvent';
import { tagEvent } from 'event/tagEvent';

export function registerEvent(bot: Telegraf) {
  userCacheEvent(bot);
  tagEvent(bot);
}
