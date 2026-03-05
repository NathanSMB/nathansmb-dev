# Database

The app uses **Drizzle ORM** with **Neon** serverless PostgreSQL.

## Connection

`src/database/connection.ts` creates a single Drizzle instance using the Neon HTTP driver. It's marked `"use server"` so it only runs server-side.

```ts
"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { DATABASE_URL } from "~/config/database";

export const connection = drizzle(DATABASE_URL);
```

The database URL is loaded from the `NETLIFY_DATABASE_URL` environment variable via `src/config/database.ts`.

## Schema Structure

All table definitions live in `src/database/schemas/`, with one file per domain. The barrel file `src/database/schema.ts` re-exports everything:

```ts
export * from "./schemas/auth";
export * from "./schemas/scores";
```

This barrel file is what Drizzle Kit uses for migrations (configured in `drizzle.config.ts`).

## Adding a New Table

1. Create a new file in `src/database/schemas/` (e.g. `posts.ts`)
2. Define the table with `pgTable`, add indexes and relations as needed:

```ts
import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const post = pgTable(
    "post",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [index("post_userId_idx").on(table.userId)],
);

export const postRelations = relations(post, ({ one }) => ({
    user: one(user, {
        fields: [post.userId],
        references: [user.id],
    }),
}));
```

3. Re-export from `src/database/schema.ts`:

```ts
export * from "./schemas/posts";
```

4. Push to the database:

```sh
bun run push-schemas
```

## Auth Schema

The auth schema (`src/database/schemas/auth.ts`) is **auto-generated** by better-auth. Do not edit it manually.

- The file is listed in `.gitignore` so it can never be committed
- The `prebuild` script creates the file (via `mkdir -p` + `touch`) before running `generate-auth-schema`, since the generation script requires the file to exist
- Regenerates automatically on `prebuild` and `predev`, or manually with `bun run generate-auth-schema`

See [docs/auth.md](./auth.md) for details on the auth tables and roles.

## Querying

Import `connection` and schema tables in any server-side code:

```ts
"use server";

import { connection } from "~/database/connection";
import { gameScore, user } from "~/database/schema";
import { eq, desc } from "drizzle-orm";

// Select with join
const scores = await connection
    .select({
        score: gameScore.score,
        userName: user.name,
    })
    .from(gameScore)
    .innerJoin(user, eq(gameScore.userId, user.id))
    .orderBy(desc(gameScore.score))
    .limit(10);

// Insert
const id = crypto.randomUUID();
await connection.insert(gameScore).values({
    id,
    userId: session.user.id,
    game: "cosmic-barrage",
    score: 1500,
    wave: 3,
});
```

All database queries must run in a `"use server"` context (server functions or API routes).

## Key Files

| File                             | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| `src/database/connection.ts`     | Drizzle instance with Neon HTTP driver           |
| `src/database/schema.ts`         | Barrel re-export of all schemas                  |
| `src/database/schemas/auth.ts`   | Auto-generated auth tables (user, session, etc.) |
| `src/database/schemas/scores.ts` | Game score table and relations                   |
| `src/config/database.ts`         | Loads `NETLIFY_DATABASE_URL` env var             |
| `drizzle.config.ts`              | Drizzle Kit config for migrations                |
