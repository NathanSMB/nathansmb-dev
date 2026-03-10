import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const comment = pgTable(
    "comment",
    {
        id: text("id").primaryKey(),
        resourceType: text("resource_type").notNull(),
        resourceId: text("resource_id").notNull(),
        parentId: text("parent_id"),
        authorId: text("author_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        content: text("content").notNull(),
        contentHtml: text("content_html").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        index("comment_resource_idx").on(table.resourceType, table.resourceId),
        index("comment_author_idx").on(table.authorId),
        index("comment_parent_idx").on(table.parentId),
    ],
);

export const commentRelations = relations(comment, ({ one, many }) => ({
    author: one(user, {
        fields: [comment.authorId],
        references: [user.id],
    }),
    parent: one(comment, {
        fields: [comment.parentId],
        references: [comment.id],
        relationName: "replies",
    }),
    replies: many(comment, { relationName: "replies" }),
}));
