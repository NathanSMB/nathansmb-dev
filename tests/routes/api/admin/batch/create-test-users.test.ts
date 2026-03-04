vi.mock("~/auth/core", () => ({
    auth: {
        api: {
            getSession: vi.fn(),
            createUser: vi.fn(() => Promise.resolve()),
        },
    },
}));

vi.mock("~/auth/test-users", () => ({
    generateRandomPassword: vi.fn(() => "mock-password"),
    getMaxTestUserNumber: vi.fn(() => Promise.resolve(0)),
}));

import { POST } from "~/routes/api/admin/batch/create-test-users";
import { auth } from "~/auth/core";

function makeEvent(body: unknown, session: unknown = null) {
    const headers = new Headers();
    (
        auth.api.getSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(session);
    return {
        request: new Request(
            "http://localhost/api/admin/batch/create-test-users",
            {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            },
        ),
    } as Parameters<typeof POST>[0];
}

describe("POST /api/admin/batch/create-test-users", () => {
    afterEach(() => vi.clearAllMocks());

    it("returns 401 when not authenticated", async () => {
        const res = await POST(makeEvent({ count: 5 }));
        expect(res.status).toBe(401);
    });

    it("returns 401 when user is not admin", async () => {
        const res = await POST(
            makeEvent({ count: 5 }, { user: { role: "user" } }),
        );
        expect(res.status).toBe(401);
    });

    it("returns 400 when count is not a number", async () => {
        const res = await POST(
            makeEvent({ count: "five" }, { user: { role: "admin" } }),
        );
        expect(res.status).toBe(400);
    });

    it("returns 400 when count is below 1", async () => {
        const res = await POST(
            makeEvent({ count: 0 }, { user: { role: "admin" } }),
        );
        expect(res.status).toBe(400);
    });

    it("returns 400 when count is above 100", async () => {
        const res = await POST(
            makeEvent({ count: 101 }, { user: { role: "admin" } }),
        );
        expect(res.status).toBe(400);
    });

    it("returns a streaming response on success", async () => {
        const res = await POST(
            makeEvent({ count: 2 }, { user: { role: "admin" } }),
        );
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    });
});
