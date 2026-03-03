export function createBatchStream(
    userIds: string[],
    operation: (userId: string) => Promise<unknown>,
): ReadableStream<string> {
    let completed = 0;
    const total = userIds.length;
    const succeededIds: string[] = [];
    let failedCount = 0;

    return new ReadableStream({
        async start(controller) {
            const send = (data: Record<string, unknown>) => {
                try {
                    controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
                } catch {
                    // Client disconnected
                }
            };

            const promises = userIds.map((userId) =>
                operation(userId)
                    .then(() => {
                        succeededIds.push(userId);
                        completed++;
                        send({ completed, total });
                    })
                    .catch(() => {
                        failedCount++;
                        completed++;
                        send({ completed, total });
                    }),
            );

            await Promise.allSettled(promises);
            send({ done: true, succeededIds, failedCount });
            try {
                controller.close();
            } catch {
                // Already closed
            }
        },
    });
}

export function batchStreamResponse(stream: ReadableStream<string>): Response {
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
