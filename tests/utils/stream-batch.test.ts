import { createBatchStream, batchStreamResponse } from "~/utils/stream-batch";

async function readStream(stream: ReadableStream<string>): Promise<string[]> {
    const reader = stream.getReader();
    const chunks: string[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return chunks;
}

function parseEvents(chunks: string[]): Record<string, unknown>[] {
    return chunks
        .join("")
        .split("\n\n")
        .filter(Boolean)
        .map((line) => {
            const match = line.match(/^data: (.+)$/m);
            return match ? JSON.parse(match[1]) : null;
        })
        .filter(Boolean);
}

describe("createBatchStream", () => {
    it("sends progress events for each item", async () => {
        const stream = createBatchStream(["a", "b", "c"], () =>
            Promise.resolve(),
        );
        const events = parseEvents(await readStream(stream));

        const progressEvents = events.filter((e) => !e.done);
        expect(progressEvents).toHaveLength(3);
        expect(progressEvents[2]).toEqual({ completed: 3, total: 3 });
    });

    it("tracks succeeded and failed items", async () => {
        const stream = createBatchStream(["ok1", "fail1", "ok2"], (id) =>
            id.startsWith("fail")
                ? Promise.reject(new Error("boom"))
                : Promise.resolve(),
        );
        const events = parseEvents(await readStream(stream));

        const done = events.find((e) => e.done);
        expect(done).toBeDefined();
        expect(done!.failedCount).toBe(1);
        expect((done!.succeededIds as string[]).sort()).toEqual(["ok1", "ok2"]);
    });

    it("handles empty array", async () => {
        const stream = createBatchStream([], () => Promise.resolve());
        const events = parseEvents(await readStream(stream));

        const done = events.find((e) => e.done);
        expect(done).toBeDefined();
        expect(done!.succeededIds).toEqual([]);
        expect(done!.failedCount).toBe(0);
    });

    it("sends a done event as the final event", async () => {
        const stream = createBatchStream(["x"], () => Promise.resolve());
        const events = parseEvents(await readStream(stream));

        const lastEvent = events[events.length - 1];
        expect(lastEvent.done).toBe(true);
    });
});

describe("batchStreamResponse", () => {
    it("returns a Response with SSE headers", () => {
        const stream = new ReadableStream<string>();
        const response = batchStreamResponse(stream);

        expect(response).toBeInstanceOf(Response);
        expect(response.headers.get("Content-Type")).toBe("text/event-stream");
        expect(response.headers.get("Cache-Control")).toBe("no-cache");
        expect(response.headers.get("Connection")).toBe("keep-alive");
    });
});
