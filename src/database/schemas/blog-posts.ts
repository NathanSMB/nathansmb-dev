import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const blogPost = pgTable(
    "blog_post",
    {
        id: text("id").primaryKey(),
        title: text("title").notNull(),
        slug: text("slug").unique().notNull(),
        content: text("content").default(""),
        excerpt: text("excerpt").default(""),
        coverImage: text("cover_image"),
        tags: text("tags").array().default([]),
        status: text("status", { enum: ["draft", "published"] })
            .default("draft")
            .notNull(),
        authorId: text("author_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        publishedAt: timestamp("published_at"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        index("blog_post_slug_idx").on(table.slug),
        index("blog_post_status_published_idx").on(
            table.status,
            table.publishedAt,
        ),
        index("blog_post_author_idx").on(table.authorId),
    ],
);

export const blogPostRelations = relations(blogPost, ({ one }) => ({
    author: one(user, {
        fields: [blogPost.authorId],
        references: [user.id],
    }),
}));
