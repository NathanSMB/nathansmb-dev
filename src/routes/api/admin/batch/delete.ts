import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import { createBatchStream, batchStreamResponse } from "~/utils/stream-batch";

export async function POST(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    if (!session || session.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }

    const { userIds } = await event.request.json();
    if (!Array.isArray(userIds) || !userIds.length) {
        return new Response("Invalid request body", { status: 400 });
    }

    const stream = createBatchStream(userIds, (userId) =>
        auth.api.removeUser({
            body: { userId },
            headers: event.request.headers,
        }),
    );

    return batchStreamResponse(stream);
}
