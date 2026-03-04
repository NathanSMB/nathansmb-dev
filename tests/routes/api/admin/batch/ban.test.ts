vi.mock("~/auth/core", () => ({
    auth: {
        api: {
            getSession: vi.fn(),
            banUser: vi.fn(),
        },
    },
}));

vi.mock("~/utils/stream-batch", () => ({
    createBatchStream: vi.fn(() => new ReadableStream()),
    batchStreamResponse: vi.fn(
        (stream: ReadableStream) => new Response(stream),
    ),
}));

import { POST } from "~/routes/api/admin/batch/ban";
import { auth } from "~/auth/core";
import { createBatchStream, batchStreamResponse } from "~/utils/stream-batch";

function makeEvent(body: unknown, session: unknown = null) {
    const headers = new Headers();
    (
        auth.api.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(session);
    return {
        request: new Request("http://localhost/api/admin/batch/ban", {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        }),
    } as Parameters<typeof POST>[0];
}

describe("POST /api/admin/batch/ban", () => {
    afterEach(() => vi.clearAllMocks());

    it("returns 401 when not authenticated", async () => {
        const res = await POST(makeEvent({ userIds: ["1"] }));
        expect(res.status).toBe(401);
    });

    it("returns 401 when user is not admin", async () => {
        const res = await POST(
            makeEvent({ userIds: ["1"] }, { user: { role: "user" } }),
        );
        expect(res.status).toBe(401);
    });

    it("returns 400 when userIds is not an array", async () => {
        const res = await POST(
            makeEvent({ userIds: "not-array" }, { user: { role: "admin" } }),
        );
        expect(res.status).toBe(400);
    });

    it("returns 400 when userIds is empty", async () => {
        const res = await POST(
            makeEvent({ userIds: [] }, { user: { role: "admin" } }),
        );
        expect(res.status).toBe(400);
    });

    it("creates a batch stream on success", async () => {
        const res = await POST(
            makeEvent(
                { userIds: ["a", "b"], banReason: "test" },
                { user: { role: "admin" } },
            ),
        );
        expect(createBatchStream).toHaveBeenCalledWith(
            ["a", "b"],
            expect.any(Function),
        );
        expect(batchStreamResponse).toHaveBeenCalled();
    });
});
