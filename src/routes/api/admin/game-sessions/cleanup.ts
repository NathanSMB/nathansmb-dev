import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { gameSession } from "~/database/schema";
import { lt } from "drizzle-orm";

export async function POST(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const deleted = await connection
        .delete(gameSession)
        .where(lt(gameSession.startedAt, oneDayAgo))
        .returning({ id: gameSession.id });

    return Response.json({ deletedCount: deleted.length });
}
