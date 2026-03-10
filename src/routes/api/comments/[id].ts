import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { comment } from "~/database/schema";
import { eq } from "drizzle-orm";
import { sanitizeMarkdown } from "~/utils/sanitize-markdown";

export async function PUT(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const id = event.params.id;
    const [existing] = await connection
        .select({ authorId: comment.authorId })
        .from(comment)
        .where(eq(comment.id, id))
        .limit(1);

    if (!existing) {
        return new Response("Comment not found", { status: 404 });
    }

    if (existing.authorId !== session.user.id) {
        return new Response("Forbidden", { status: 403 });
    }

    const body = await event.request.json();
    const { content } = body;

    if (
        typeof content !== "string" ||
        content.length < 1 ||
        content.length > 2000
    ) {
        return new Response("Content must be 1–2000 characters", {
            status: 400,
        });
    }

    const contentHtml = await sanitizeMarkdown(content);
    const now = new Date();

    await connection
        .update(comment)
        .set({ content, contentHtml, updatedAt: now })
        .where(eq(comment.id, id));

    return Response.json({
        comment: { contentHtml, updatedAt: now.toISOString() },
    });
}

export async function DELETE(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const id = event.params.id;
    const [existing] = await connection
        .select({ authorId: comment.authorId })
        .from(comment)
        .where(eq(comment.id, id))
        .limit(1);

    if (!existing) {
        return new Response("Comment not found", { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    if (existing.authorId !== session.user.id && !isAdmin) {
        return new Response("Forbidden", { status: 403 });
    }

    await connection.delete(comment).where(eq(comment.id, id));

    return Response.json({ success: true });
}
