import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { gameScore, gameSession, user } from "~/database/schema";
import { desc, eq, and, gt } from "drizzle-orm";

export async function GET(event: APIEvent) {
    const url = new URL(event.request.url);
    const game = url.searchParams.get("game");
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "10"), 50);

    if (!game) {
        return new Response("Missing game parameter", { status: 400 });
    }

    const scores = await connection
        .select({
            id: gameScore.id,
            score: gameScore.score,
            wave: gameScore.wave,
            createdAt: gameScore.createdAt,
            userName: user.name,
        })
        .from(gameScore)
        .innerJoin(user, eq(gameScore.userId, user.id))
        .where(eq(gameScore.game, game))
        .orderBy(desc(gameScore.score))
        .limit(limit);

    return Response.json(scores);
}

export async function POST(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await event.request.json();
    const { game, score, wave, gameSessionId } = body;

    if (
        typeof game !== "string" ||
        typeof score !== "number" ||
        typeof wave !== "number" ||
        typeof gameSessionId !== "string"
    ) {
        return new Response("Invalid request body", { status: 400 });
    }

    if (
        score < 0 ||
        wave < 0 ||
        !Number.isInteger(score) ||
        !Number.isInteger(wave)
    ) {
        return new Response("Invalid score or wave value", { status: 400 });
    }

    // Validate game session
    const [gs] = await connection
        .select()
        .from(gameSession)
        .where(eq(gameSession.id, gameSessionId))
        .limit(1);

    if (!gs) {
        return new Response("Invalid game session", { status: 400 });
    }
    if (gs.userId !== session.user.id) {
        return new Response("Session does not belong to user", { status: 403 });
    }
    if (gs.submitted) {
        return new Response("Session already submitted", { status: 409 });
    }

    // Plausibility checks
    const now = new Date();
    const durationSeconds = (now.getTime() - gs.startedAt.getTime()) / 1000;

    if (durationSeconds < 5) {
        return new Response("Game too short", { status: 400 });
    }
    if (wave > Math.floor(durationSeconds / 30) + 2) {
        return new Response("Implausible wave count", { status: 400 });
    }
    if (score > durationSeconds * 3000) {
        return new Response("Implausible score", { status: 400 });
    }

    // Mark session as submitted
    await connection
        .update(gameSession)
        .set({ submitted: true, endedAt: now })
        .where(eq(gameSession.id, gameSessionId));

    const id = crypto.randomUUID();
    const [created] = await connection
        .insert(gameScore)
        .values({
            id,
            userId: session.user.id,
            game,
            score,
            wave,
        })
        .returning();

    return Response.json(created, { status: 201 });
}
