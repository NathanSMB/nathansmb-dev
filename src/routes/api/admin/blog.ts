import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { blogPost, user } from "~/database/schema";
import { desc, asc, eq, like, and, sql, count } from "drizzle-orm";
import { invalidateAllPosts } from "~/blog/cache";

export async function GET(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(event.request.url);
    const limit = Math.min(
        parseInt(url.searchParams.get("limit") ?? "10"),
        100,
    );
    const offset = parseInt(url.searchParams.get("offset") ?? "0");
    const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
    const sortDir = url.searchParams.get("sortDirection") ?? "desc";
    const search = url.searchParams.get("search") ?? "";
    const status = url.searchParams.get("status") ?? "";

    const sortColumns: Record<string, any> = {
        title: blogPost.title,
        status: blogPost.status,
        createdAt: blogPost.createdAt,
        publishedAt: blogPost.publishedAt,
        authorName: user.name,
    };

    const sortColumn = sortColumns[sortBy] ?? blogPost.createdAt;
    const orderBy = sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

    const conditions = [];
    if (search) conditions.push(like(blogPost.title, `%${search}%`));
    if (status === "draft" || status === "published")
        conditions.push(eq(blogPost.status, status));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [posts, [{ total }]] = await Promise.all([
        connection
            .select({
                id: blogPost.id,
                title: blogPost.title,
                slug: blogPost.slug,
                status: blogPost.status,
                tags: blogPost.tags,
                authorName: user.name,
                publishedAt: blogPost.publishedAt,
                createdAt: blogPost.createdAt,
            })
            .from(blogPost)
            .innerJoin(user, eq(blogPost.authorId, user.id))
            .where(whereClause)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset),
        connection
            .select({ total: count() })
            .from(blogPost)
            .innerJoin(user, eq(blogPost.authorId, user.id))
            .where(whereClause),
    ]);

    return Response.json({ posts, total });
}

export async function POST(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await event.request.json();
    const { title, slug, content, excerpt, coverImage, tags, status } = body;

    if (!title || !slug) {
        return new Response("Title and slug are required", { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await connection.insert(blogPost).values({
        id,
        title,
        slug,
        content: content ?? "",
        excerpt: excerpt ?? "",
        coverImage: coverImage || null,
        tags: tags ?? [],
        status: status ?? "draft",
        authorId: session.user.id,
        publishedAt: status === "published" ? now : null,
        createdAt: now,
        updatedAt: now,
    });

    invalidateAllPosts();

    return Response.json({ id });
}
