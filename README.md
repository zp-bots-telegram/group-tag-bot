# Group Tag Bot

Keep track of your D&amp;D groups items with this application

## Running your own

Requires a PostgreSQL instance to connect to. Easiest way to get started with this.

1. Pull the postgres docker image

```
docker pull postgres
```

2. Run your own postgres container

```
docker run -d --name dev-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
```

3. Create a .env file with the following values

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dev
```

4. Deploy the Prisma Schema

```
yarn db:deploy
```
