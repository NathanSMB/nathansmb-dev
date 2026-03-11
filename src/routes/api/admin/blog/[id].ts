import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { blogPost } from "~/database/schema";
import { eq } from "drizzle-orm";
import { invalidatePost, invalidateAllPosts } from "~/blog/cache";

export async function GET(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const id = event.params.id;
    const [post] = await connection
        .select()
        .from(blogPost)
        .where(eq(blogPost.id, id))
        .limit(1);

    if (!post) {
        return new Response("Not found", { status: 404 });
    }

    return Response.json(post);
}

export async function PUT(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const id = event.params.id;
    const body = await event.request.json();
    const { title, slug, content, excerpt, coverImage, tags, status } = body;

    const [existing] = await connection
        .select({ status: blogPost.status, publishedAt: blogPost.publishedAt })
        .from(blogPost)
        .where(eq(blogPost.id, id))
        .limit(1);

    if (!existing) {
        return new Response("Not found", { status: 404 });
    }

    const now = new Date();
    const publishedAt =
        status === "published" && !existing.publishedAt
            ? now
            : existing.publishedAt;

    await connection
        .update(blogPost)
        .set({
            title,
            slug,
            content,
            excerpt,
            coverImage: coverImage || null,
            tags: tags ?? [],
            status,
            publishedAt,
            updatedAt: now,
        })
        .where(eq(blogPost.id, id));

    invalidatePost(slug);
    invalidateAllPosts();

    return Response.json({ success: true });
}

export async function DELETE(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const id = event.params.id;
    await connection.delete(blogPost).where(eq(blogPost.id, id));

    invalidateAllPosts();

    return Response.json({ success: true });
}
