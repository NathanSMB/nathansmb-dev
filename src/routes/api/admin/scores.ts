import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { gameScore, user } from "~/database/schema";
import { desc, asc, eq, like, sql, count } from "drizzle-orm";

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

    const sortColumns: Record<string, any> = {
        score: gameScore.score,
        wave: gameScore.wave,
        createdAt: gameScore.createdAt,
        userName: user.name,
    };

    const sortColumn = sortColumns[sortBy] ?? gameScore.createdAt;
    const orderBy = sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

    const whereClause = search ? like(user.name, `%${search}%`) : undefined;

    const [scores, [{ total }]] = await Promise.all([
        connection
            .select({
                id: gameScore.id,
                score: gameScore.score,
                wave: gameScore.wave,
                game: gameScore.game,
                createdAt: gameScore.createdAt,
                userName: user.name,
                userId: gameScore.userId,
            })
            .from(gameScore)
            .innerJoin(user, eq(gameScore.userId, user.id))
            .where(whereClause)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset),
        connection
            .select({ total: count() })
            .from(gameScore)
            .innerJoin(user, eq(gameScore.userId, user.id))
            .where(whereClause),
    ]);

    return Response.json({ scores, total });
}

export async function DELETE(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const { scoreId } = await event.request.json();
    if (typeof scoreId !== "string") {
        return new Response("Invalid request body", { status: 400 });
    }

    await connection.delete(gameScore).where(eq(gameScore.id, scoreId));

    return Response.json({ success: true });
}
