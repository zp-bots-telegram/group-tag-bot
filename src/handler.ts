import express, { Request, Response } from 'express';

import { Telegraf } from 'telegraf';
import { getEnv } from 'shared/env';
import { devSetup } from 'devSetup';
import { registerCommands } from 'command/commands';
import { registerEvent } from 'event/events';
import * as fs from 'fs';
import { prisma } from 'platform/db/client';

async function handleUserMigration() {
  if (!fs.existsSync('migrationUserStore.json')) return;
  const migrationUserStore: { usernameCache: { [index: string]: string } } =
    JSON.parse(fs.readFileSync('migrationUserStore.json').toString());
  const users = migrationUserStore.usernameCache;
  const usersLength = Object.keys(users).length;
  console.log('Total Users to Migrate:', usersLength);
  const usersMapped = Object.entries(users).map(([userId, username]) => ({
    userId: Number.parseInt(userId),
    username
  }));
  await prisma.user.createMany({
    data: usersMapped,
    skipDuplicates: true
  });
  console.log('Users Migrated');
}

type Groups = {
  groups: {
    [groupId: string]: {
      id: number;
      userIds: number[];
      tags: {
        [tagName: string]: {
          tag: string;
          users: number[];
        };
      };
      userIDs: number[];
      onlyAdmins: boolean;
      allowBroadcasts: boolean;
    };
  };
};

async function handleDataMigration() {
  if (!fs.existsSync('migrationDataStore.json')) return;
  const migrationDataStore: Groups = JSON.parse(
    fs.readFileSync('migrationDataStore.json').toString()
  );
  const groups = migrationDataStore.groups;
  const groupLength = Object.keys(groups).length;
  console.log('Total Groups to Migrate:', groupLength);
  const groupsToCreate = Object.entries(groups).map(([, group]) => ({
    groupId: group.id,
    broadcasts: group.allowBroadcasts,
    adminOnly: group.onlyAdmins
  }));

  await prisma.group.createMany({
    data: groupsToCreate,
    skipDuplicates: true
  });
  console.log('Groups Migrated');

  const tagsToCreate = Object.entries(groups)
    .map(([, group]) => {
      return Object.entries(group.tags).map(([, tag]) => ({
        name: tag.tag,
        groupId: group.id
      }));
    })
    .reduce((acc, curVal) => acc.concat(curVal));

  console.log('Total Tags to Migrate:', tagsToCreate.length);

  await prisma.tag.createMany({
    data: tagsToCreate,
    skipDuplicates: true
  });

  console.log('Tags Migrated');

  const tagsToUsersToCreate = Object.entries(groups)
    .map(([, group]) => {
      return Object.entries(group.tags).map(([, tag]) => ({
        name: tag.tag,
        groupId: group.id,
        users: tag.users.map((user) => ({
          where: { userId: user },
          create: { userId: user }
        }))
      }));
    })
    .reduce((acc, curVal) => acc.concat(curVal));

  const tagsToUsersToCreateLength = tagsToUsersToCreate.length;
  console.log(
    'Total Tags to User Links to Migrate:',
    tagsToUsersToCreateLength
  );

  for (const tag of tagsToUsersToCreate) {
    await prisma.tag.update({
      where: { name_groupId: { name: tag.name, groupId: tag.groupId } },
      data: {
        users: { connectOrCreate: tag.users }
      }
    });
  }

  console.log('Tag to User Links Migrated');

  const groupsToUsersToCreate = Object.entries(groups).map(([, group]) => ({
    groupId: group.id,
    users: group.userIDs.map((user) => ({
      where: { userId: user },
      create: { userId: user }
    }))
  }));

  console.log(
    'Total Groups to User Links to Migrate:',
    groupsToUsersToCreate.length
  );

  let i = 0;
  for (const group of groupsToUsersToCreate) {
    ++i;
    await prisma.group.update({
      where: { groupId: group.groupId },
      data: {
        users: { connectOrCreate: group.users }
      }
    });
    if (i % 50 === 0) {
      console.log(
        `Group to User Links Done: ${i} of ${groupsToUsersToCreate.length}`
      );
    }
  }

  console.log('Group to User Links Migrated');
}

export async function handler() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error('BOT_TOKEN must be provided!');
  }

  if (getEnv('NODE_ENV') === 'development') {
    await devSetup();
  }

  await handleUserMigration();
  await handleDataMigration();

  const bot = new Telegraf(token);

  registerEvent(bot);
  registerCommands(bot);

  const host = getEnv('host');
  const secretPath = `/telegraf/${bot.secretPathComponent()}`;

  await bot.telegram.setWebhook(`${host}${secretPath}`);

  const app = express();
  app.get('/', (req: Request, res: Response) => res.send('Hello World!'));
  // Set the bot API endpoint
  app.use(bot.webhookCallback(secretPath));
  app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
  });
}

handler()
  .then(() => console.log('Bot Running'))
  .catch((error) => {
    console.error('Uncaught Error Thrown', error);
  });
