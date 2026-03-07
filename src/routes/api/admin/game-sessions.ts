import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { gameSession, user } from "~/database/schema";
import { desc, asc, eq, lt, count } from "drizzle-orm";

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
    const sortBy = url.searchParams.get("sortBy") ?? "startedAt";
    const sortDir = url.searchParams.get("sortDirection") ?? "desc";

    const sortColumns: Record<string, any> = {
        startedAt: gameSession.startedAt,
        endedAt: gameSession.endedAt,
        submitted: gameSession.submitted,
        userName: user.name,
        game: gameSession.game,
    };

    const sortColumn = sortColumns[sortBy] ?? gameSession.startedAt;
    const orderBy = sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [sessions, [{ total }], [{ staleCount }]] = await Promise.all([
        connection
            .select({
                id: gameSession.id,
                game: gameSession.game,
                startedAt: gameSession.startedAt,
                endedAt: gameSession.endedAt,
                submitted: gameSession.submitted,
                userName: user.name,
                userId: gameSession.userId,
            })
            .from(gameSession)
            .innerJoin(user, eq(gameSession.userId, user.id))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset),
        connection.select({ total: count() }).from(gameSession),
        connection
            .select({ staleCount: count() })
            .from(gameSession)
            .where(lt(gameSession.startedAt, oneDayAgo)),
    ]);

    return Response.json({ sessions, total, staleCount });
}
