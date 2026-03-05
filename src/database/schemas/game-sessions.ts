import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const gameSession = pgTable(
    "game_session",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        game: text("game").notNull(),
        startedAt: timestamp("started_at").defaultNow().notNull(),
        endedAt: timestamp("ended_at"),
        submitted: boolean("submitted").default(false).notNull(),
    },
    (table) => [index("game_session_userId_idx").on(table.userId)],
);
