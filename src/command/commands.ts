import { Telegraf } from 'telegraf';
import { createCommand } from 'command/createCommand';
import { tagsCommand } from 'command/tagsCommand';
import { addCommand } from 'command/addCommand';
import { deleteCommand } from 'command/deleteCommand';
import { infoCommand } from 'command/infoCommand';
import { removeCommand } from 'command/removeCommand';

export function registerCommands(bot: Telegraf) {
  addCommand(bot);
  createCommand(bot);
  tagsCommand(bot);
  deleteCommand(bot);
  infoCommand(bot);
  removeCommand(bot);
}
