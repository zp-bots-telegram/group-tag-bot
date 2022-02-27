import { Telegraf } from 'telegraf';
import { createCommand } from 'command/createCommand';
import { tagsCommand } from 'command/tagsCommand';
import { addCommand } from 'command/addCommand';
import { infoCommand } from 'command/infoCommand';

export function registerCommands(bot: Telegraf) {
  addCommand(bot);
  createCommand(bot);
  tagsCommand(bot);
  infoCommand(bot);
}
