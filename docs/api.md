# API Routes

All API endpoints live under `src/routes/api/` using SolidStart's file-based routing.

## Auth Pattern

**Unauthenticated** endpoints read from the request directly:

```ts
export async function GET(event: APIEvent) {
    const url = new URL(event.request.url);
    const game = url.searchParams.get("game");
    // ...
}
```

**Authenticated** endpoints check the session via better-auth:

```ts
const session = await auth.api.getSession({
    headers: event.request.headers,
});
if (!session) {
    return new Response("Unauthorized", { status: 401 });
}
```

**Admin** endpoints add a role check:

```ts
if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
}
```

## Game Endpoints

### `GET /api/games/leaderboard`

Returns top scores for a game.

| Param   | Type   | Required | Description                      |
| ------- | ------ | -------- | -------------------------------- |
| `game`  | string | yes      | Game identifier                  |
| `limit` | number | no       | Max results (default 10, max 50) |

Response: `200` with array of `{ id, score, wave, createdAt, userName }`.

### `POST /api/games/leaderboard`

Submits a new score. Requires authentication.

Body: `{ game: string, score: number, wave: number }`

- `score` and `wave` must be non-negative integers
- Rate limited: one submission per game per 5 seconds

Response: `201` with the created score record, or `429` if submitted too recently.

## Admin Batch Endpoints

All batch endpoints follow the same pattern: `POST`, admin-only, accept `{ userIds: string[] }` in the body, and return an SSE stream of progress events.

### `POST /api/admin/batch/ban`

Bans users. Body: `{ userIds: string[], banReason?: string }`

### `POST /api/admin/batch/unban`

Unbans users. Body: `{ userIds: string[] }`

### `POST /api/admin/batch/delete`

Deletes user accounts. Body: `{ userIds: string[] }`

### `POST /api/admin/batch/set-role`

Changes user roles. Body: `{ userIds: string[], role: "user" | "admin" }`

### `POST /api/admin/batch/create-test-users`

Creates test accounts. Body: `{ count: number }` (1–100). Uses its own streaming format with `{ completed, total, created }` progress events and `{ done: true, created, startedAt }` on completion.

## Batch Streaming Protocol

The batch endpoints use **Server-Sent Events** (SSE) to stream progress to the client.

### Server side

`createBatchStream()` from `src/utils/stream-batch.ts` handles the streaming pattern:

```ts
import { createBatchStream, batchStreamResponse } from "~/utils/stream-batch";

const stream = createBatchStream(userIds, (userId) =>
    auth.api.banUser({
        body: { userId, banReason },
        headers: event.request.headers,
    }),
);

return batchStreamResponse(stream);
```

Events are sent as `data: <JSON>\n\n`:

- **Progress**: `{ completed: number, total: number }`
- **Done**: `{ done: true, succeededIds: string[], failedCount: number }`

### Client side

`consumeBatchStream()` from `src/utils/batch-stream.ts` parses the SSE stream:

```ts
import { consumeBatchStream } from "~/utils/batch-stream";

await consumeBatchStream(
    "/api/admin/batch/ban",
    { userIds, banReason },
    (progress) => setProgress(progress.completed / progress.total),
    (result) => console.log(`Done: ${result.succeededIds.length} succeeded`),
    (error) => setError(error),
);
```

### Interfaces

```ts
interface BatchProgress {
    completed: number;
    total: number;
}

interface BatchDone {
    succeededIds: string[];
    failedCount: number;
}
```

## Auth Routes

`src/routes/api/auth/*all.ts` is a catch-all that delegates to better-auth via `toSolidStartHandler()`. See [docs/auth.md](./auth.md) for auth details.

## Key Files

| File                                              | Purpose                            |
| ------------------------------------------------- | ---------------------------------- |
| `src/routes/api/games/leaderboard.ts`             | Game score GET/POST endpoints      |
| `src/routes/api/admin/batch/ban.ts`               | Batch ban users                    |
| `src/routes/api/admin/batch/unban.ts`             | Batch unban users                  |
| `src/routes/api/admin/batch/delete.ts`            | Batch delete users                 |
| `src/routes/api/admin/batch/set-role.ts`          | Batch set user roles               |
| `src/routes/api/admin/batch/create-test-users.ts` | Bulk create test accounts          |
| `src/routes/api/auth/*all.ts`                     | Better-auth catch-all handler      |
| `src/utils/stream-batch.ts`                       | Server-side batch stream utilities |
| `src/utils/batch-stream.ts`                       | Client-side batch stream consumer  |
