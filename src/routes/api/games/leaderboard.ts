import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { connection } from "~/database/connection";
import { gameScore, user } from "~/database/schema";
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
    const { game, score, wave } = body;

    if (
        typeof game !== "string" ||
        typeof score !== "number" ||
        typeof wave !== "number"
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

    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const recent = await connection
        .select({ id: gameScore.id })
        .from(gameScore)
        .where(
            and(
                eq(gameScore.userId, session.user.id),
                eq(gameScore.game, game),
                gt(gameScore.createdAt, fiveSecondsAgo),
            ),
        )
        .limit(1);

    if (recent.length > 0) {
        return new Response("Score submitted too recently", { status: 429 });
    }

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
