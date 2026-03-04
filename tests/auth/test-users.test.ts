vi.mock("drizzle-orm", () => ({ like: vi.fn() }));
vi.mock("vinxi/http", () => ({ getWebRequest: vi.fn() }));
vi.mock("~/auth/core", () => ({ auth: { api: {} } }));
vi.mock("~/database/connection", () => ({ connection: {} }));
vi.mock("~/database/schema", () => ({ user: {} }));

import {
    generateRandomPassword,
    extractTestUserNumber,
} from "~/auth/test-users";

describe("generateRandomPassword", () => {
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

    it("returns a 24-character string", () => {
        expect(generateRandomPassword()).toHaveLength(24);
    });

    it("only contains characters from the expected charset", () => {
        const pw = generateRandomPassword();
        for (const ch of pw) {
            expect(charset).toContain(ch);
        }
    });

    it("generates unique passwords on successive calls", () => {
        const passwords = new Set(
            Array.from({ length: 20 }, () => generateRandomPassword()),
        );
        expect(passwords.size).toBe(20);
    });
});

describe("extractTestUserNumber", () => {
    it("extracts the number from a valid test user email", () => {
        expect(extractTestUserNumber("testuser1@example.com")).toBe(1);
        expect(extractTestUserNumber("testuser42@example.com")).toBe(42);
        expect(extractTestUserNumber("testuser100@example.com")).toBe(100);
    });

    it("returns null for non-matching emails", () => {
        expect(extractTestUserNumber("user@example.com")).toBeNull();
        expect(extractTestUserNumber("testuser@example.com")).toBeNull();
        expect(extractTestUserNumber("testuser1@other.com")).toBeNull();
        expect(extractTestUserNumber("")).toBeNull();
    });

    it("returns null for partial matches", () => {
        expect(extractTestUserNumber("xtestuser1@example.com")).toBeNull();
        expect(extractTestUserNumber("testuser1@example.com.evil")).toBeNull();
    });
});
