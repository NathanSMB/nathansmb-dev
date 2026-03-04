import { isValidRole, validRoles } from "~/components/admin/types";

describe("validRoles", () => {
    it("contains exactly user and admin", () => {
        expect(validRoles).toEqual(["user", "admin"]);
    });
});

describe("isValidRole", () => {
    it('returns true for "user"', () => {
        expect(isValidRole("user")).toBe(true);
    });

    it('returns true for "admin"', () => {
        expect(isValidRole("admin")).toBe(true);
    });

    it("returns false for unknown roles", () => {
        expect(isValidRole("superadmin")).toBe(false);
        expect(isValidRole("")).toBe(false);
        expect(isValidRole("USER")).toBe(false);
    });
});
