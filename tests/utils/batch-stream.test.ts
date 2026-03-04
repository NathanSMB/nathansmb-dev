import { consumeBatchStream } from "~/utils/batch-stream";

function createSSEStream(events: Record<string, unknown>[]): ReadableStream {
    const text = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(text));
            controller.close();
        },
    });
}

describe("consumeBatchStream", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("calls onProgress for progress events and onDone for the done event", async () => {
        const progressCalls: { completed: number; total: number }[] = [];
        let doneResult: { succeededIds: string[]; failedCount: number } | null =
            null;

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                createSSEStream([
                    { completed: 1, total: 2 },
                    { completed: 2, total: 2 },
                    { done: true, succeededIds: ["a", "b"], failedCount: 0 },
                ]),
                { status: 200 },
            ),
        );

        await consumeBatchStream(
            "/api/test",
            { userIds: ["a", "b"] },
            (p) => progressCalls.push(p),
            (d) => {
                doneResult = d;
            },
            () => {},
        );

        expect(progressCalls).toEqual([
            { completed: 1, total: 2 },
            { completed: 2, total: 2 },
        ]);
        expect(doneResult).toEqual({
            succeededIds: ["a", "b"],
            failedCount: 0,
        });
    });

    it("calls onError for non-ok response", async () => {
        let errorMsg = "";

        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response("Unauthorized", { status: 401 }),
        );

        await consumeBatchStream(
            "/api/test",
            {},
            () => {},
            () => {},
            (msg) => {
                errorMsg = msg;
            },
        );

        expect(errorMsg).toBe("Unauthorized");
    });

    it("calls onError on network failure", async () => {
        let errorMsg = "";

        vi.spyOn(globalThis, "fetch").mockRejectedValue(
            new Error("Network error"),
        );

        await consumeBatchStream(
            "/api/test",
            {},
            () => {},
            () => {},
            (msg) => {
                errorMsg = msg;
            },
        );

        expect(errorMsg).toBe("Connection lost during batch operation");
    });

    it("sends POST with JSON content type", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue(
                new Response(createSSEStream([]), { status: 200 }),
            );

        await consumeBatchStream(
            "/api/batch",
            { userIds: ["x"] },
            () => {},
            () => {},
            () => {},
        );

        expect(fetchSpy).toHaveBeenCalledWith("/api/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userIds: ["x"] }),
        });
    });
});
