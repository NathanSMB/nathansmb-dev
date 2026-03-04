vi.mock("~/routes/admin", () => ({
    navLinks: [
        { href: "/admin", label: "Users" },
        { href: "/admin/tools/create-test-users", label: "Create Test Users" },
    ],
}));

import { getSectionLinks, defaultLinks } from "~/components/nav/nav-links";

describe("defaultLinks", () => {
    it("contains Home, About, and Space Invaders links", () => {
        expect(defaultLinks).toEqual([
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
            {
                href: "/games/space-invaders",
                label: "Space Invaders",
                auth: true,
            },
        ]);
    });
});

describe("getSectionLinks", () => {
    it("returns admin links for exact /admin path", () => {
        const links = getSectionLinks("/admin");
        expect(links).toBeDefined();
        expect(links![0].href).toBe("/admin");
    });

    it("returns admin links for /admin/ sub-paths", () => {
        expect(getSectionLinks("/admin/users")).toBeDefined();
        expect(getSectionLinks("/admin/tools/create-test-users")).toBeDefined();
    });

    it("returns undefined for non-matching paths", () => {
        expect(getSectionLinks("/")).toBeUndefined();
        expect(getSectionLinks("/about")).toBeUndefined();
        expect(getSectionLinks("/settings")).toBeUndefined();
    });

    it("does not match partial prefixes", () => {
        expect(getSectionLinks("/administrator")).toBeUndefined();
        expect(getSectionLinks("/admin-panel")).toBeUndefined();
    });
});
