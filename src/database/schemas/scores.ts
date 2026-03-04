import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const gameScore = pgTable(
    "game_score",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        game: text("game").notNull(),
        score: integer("score").notNull(),
        wave: integer("wave").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("game_score_game_score_idx").on(table.game, table.score),
        index("game_score_userId_idx").on(table.userId),
    ],
);

export const gameScoreRelations = relations(gameScore, ({ one }) => ({
    user: one(user, {
        fields: [gameScore.userId],
        references: [user.id],
    }),
}));
