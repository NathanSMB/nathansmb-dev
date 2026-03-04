vi.mock("~/auth/core", () => ({
    auth: {
        api: {
            getSession: vi.fn(),
            setRole: vi.fn(),
        },
    },
}));

vi.mock("~/utils/stream-batch", () => ({
    createBatchStream: vi.fn(() => new ReadableStream()),
    batchStreamResponse: vi.fn(
        (stream: ReadableStream) => new Response(stream),
    ),
}));

import { POST } from "~/routes/api/admin/batch/set-role";
import { auth } from "~/auth/core";
import { createBatchStream, batchStreamResponse } from "~/utils/stream-batch";

function makeEvent(body: unknown, session: unknown = null) {
    const headers = new Headers();
    (
        auth.api.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(session);
    return {
        request: new Request("http://localhost/api/admin/batch/set-role", {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        }),
    } as Parameters<typeof POST>[0];
}

describe("POST /api/admin/batch/set-role", () => {
    afterEach(() => vi.clearAllMocks());

    it("returns 401 when not authenticated", async () => {
        const res = await POST(makeEvent({ userIds: ["1"], role: "user" }));
        expect(res.status).toBe(401);
    });

    it("returns 401 when user is not admin", async () => {
        const res = await POST(
            makeEvent(
                { userIds: ["1"], role: "user" },
                { user: { role: "user" } },
            ),
        );
        expect(res.status).toBe(401);
    });

    it("returns 400 when userIds is not an array", async () => {
        const res = await POST(
            makeEvent(
                { userIds: "bad", role: "user" },
                { user: { role: "admin" } },
            ),
        );
        expect(res.status).toBe(400);
    });

    it("returns 400 when userIds is empty", async () => {
        const res = await POST(
            makeEvent(
                { userIds: [], role: "admin" },
                { user: { role: "admin" } },
            ),
        );
        expect(res.status).toBe(400);
    });

    it("returns 400 when role is not a string", async () => {
        const res = await POST(
            makeEvent(
                { userIds: ["1"], role: 123 },
                { user: { role: "admin" } },
            ),
        );
        expect(res.status).toBe(400);
    });

    it("returns 400 when role is missing", async () => {
        const res = await POST(
            makeEvent({ userIds: ["1"] }, { user: { role: "admin" } }),
        );
        expect(res.status).toBe(400);
    });

    it("creates a batch stream on success", async () => {
        await POST(
            makeEvent(
                { userIds: ["a"], role: "admin" },
                { user: { role: "admin" } },
            ),
        );
        expect(createBatchStream).toHaveBeenCalledWith(
            ["a"],
            expect.any(Function),
        );
        expect(batchStreamResponse).toHaveBeenCalled();
    });
});
