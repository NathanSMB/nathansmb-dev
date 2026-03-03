import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";
import {
  generateRandomPassword,
  getMaxTestUserNumber,
} from "~/auth/test-users";

export async function POST(event: APIEvent) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { count } = await event.request.json();
  if (typeof count !== "number" || count < 1 || count > 100) {
    return new Response("Count must be between 1 and 100", { status: 400 });
  }

  const startNumber = (await getMaxTestUserNumber()) + 1;
  let completed = 0;
  let created = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      const promises = Array.from({ length: count }, (_, i) => {
        const n = startNumber + i;
        return auth.api
          .createUser({
            body: {
              name: `TestUser${n}`,
              email: `testuser${n}@example.com`,
              password: generateRandomPassword(),
              role: "user",
            },
          })
          .then(() => {
            created++;
            completed++;
            send({ completed, total: count, created });
          })
          .catch((err) => {
            console.error(`Failed to create TestUser${n}:`, err);
            completed++;
            send({ completed, total: count, created });
          });
      });

      await Promise.allSettled(promises);
      send({ done: true, created, startedAt: startNumber });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
