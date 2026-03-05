import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { gameSession } from "~/database/schema";

export async function POST(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const id = crypto.randomUUID();
    const [created] = await connection
        .insert(gameSession)
        .values({
            id,
            userId: session.user.id,
            game: "cosmic-barrage",
        })
        .returning({ id: gameSession.id });

    return Response.json({ sessionId: created.id }, { status: 201 });
}
