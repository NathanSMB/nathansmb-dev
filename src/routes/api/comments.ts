import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { comment, blogPost, user } from "~/database/schema";
import { eq, and, asc } from "drizzle-orm";
import { sanitizeMarkdown } from "~/utils/sanitize-markdown";

export interface CommentData {
    id: string;
    resourceType: string;
    resourceId: string;
    parentId: string | null;
    content: string;
    contentHtml: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    authorName: string;
    authorImage: string | null;
    authorRole: string | null;
    replies: CommentData[];
}

export async function GET(event: APIEvent) {
    const url = new URL(event.request.url);
    const resourceType = url.searchParams.get("resourceType");
    const resourceId = url.searchParams.get("resourceId");

    if (!resourceType || !resourceId) {
        return new Response("resourceType and resourceId are required", {
            status: 400,
        });
    }

    const rows = await connection
        .select({
            id: comment.id,
            resourceType: comment.resourceType,
            resourceId: comment.resourceId,
            parentId: comment.parentId,
            content: comment.content,
            contentHtml: comment.contentHtml,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            authorId: comment.authorId,
            authorName: user.name,
            authorImage: user.image,
            authorRole: user.role,
        })
        .from(comment)
        .innerJoin(user, eq(comment.authorId, user.id))
        .where(
            and(
                eq(comment.resourceType, resourceType),
                eq(comment.resourceId, resourceId),
            ),
        )
        .orderBy(asc(comment.createdAt));

    // Build tree: top-level + replies nested under parent
    const topLevel: CommentData[] = [];
    const byId = new Map<string, CommentData>();

    for (const row of rows) {
        const c: CommentData = {
            ...row,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
            replies: [],
        };
        byId.set(c.id, c);
    }

    for (const c of byId.values()) {
        if (c.parentId && byId.has(c.parentId)) {
            byId.get(c.parentId)!.replies.push(c);
        } else {
            topLevel.push(c);
        }
    }

    return Response.json({ comments: topLevel });
}

export async function POST(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (session.user.banned) {
        return new Response("Forbidden", { status: 403 });
    }

    const body = await event.request.json();
    const { resourceType, resourceId, parentId, content } = body;

    if (!resourceType || !resourceId || !content) {
        return new Response(
            "resourceType, resourceId, and content are required",
            { status: 400 },
        );
    }

    if (
        typeof content !== "string" ||
        content.length < 1 ||
        content.length > 2000
    ) {
        return new Response("Content must be 1–2000 characters", {
            status: 400,
        });
    }

    // Validate resource exists
    if (resourceType === "blog_post") {
        const [post] = await connection
            .select({ id: blogPost.id })
            .from(blogPost)
            .where(
                and(
                    eq(blogPost.id, resourceId),
                    eq(blogPost.status, "published"),
                ),
            )
            .limit(1);

        if (!post) {
            return new Response("Blog post not found or not published", {
                status: 404,
            });
        }
    }

    // Validate parentId: must exist and be a top-level comment
    if (parentId) {
        const [parent] = await connection
            .select({ id: comment.id, parentId: comment.parentId })
            .from(comment)
            .where(eq(comment.id, parentId))
            .limit(1);

        if (!parent) {
            return new Response("Parent comment not found", { status: 404 });
        }

        if (parent.parentId !== null) {
            return new Response(
                "Replies can only be made to top-level comments",
                { status: 400 },
            );
        }
    }

    const contentHtml = await sanitizeMarkdown(content);
    const id = crypto.randomUUID();
    const now = new Date();

    await connection.insert(comment).values({
        id,
        resourceType,
        resourceId,
        parentId: parentId ?? null,
        authorId: session.user.id,
        content,
        contentHtml,
        createdAt: now,
        updatedAt: now,
    });

    const [authorRow] = await connection
        .select({ name: user.name, image: user.image, role: user.role })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

    const newComment: CommentData = {
        id,
        resourceType,
        resourceId,
        parentId: parentId ?? null,
        content,
        contentHtml,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        authorId: session.user.id,
        authorName: authorRow?.name ?? session.user.name,
        authorImage: authorRow?.image ?? null,
        authorRole: authorRow?.role ?? null,
        replies: [],
    };

    return Response.json({ comment: newComment }, { status: 201 });
}
