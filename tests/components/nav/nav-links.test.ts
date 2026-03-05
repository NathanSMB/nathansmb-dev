vi.mock("~/routes/admin", () => ({
    navLinks: [
        { href: "/admin", label: "Users" },
        { href: "/admin/tools/create-test-users", label: "Create Test Users" },
    ],
}));

import {
    getSectionLinks,
    defaultLinks,
    isNavGroup,
    filterLinks,
} from "~/components/nav/nav-links";

describe("defaultLinks", () => {
    it("contains Home, About, and Games group", () => {
        expect(defaultLinks).toEqual([
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
            {
                label: "Games",
                children: [
                    {
                        href: "/games/space-invaders",
                        label: "Space Invaders",
                        auth: true,
                    },
                ],
            },
        ]);
    });
});

describe("isNavGroup", () => {
    it("returns true for group entries", () => {
        expect(isNavGroup({ label: "Games", children: [] })).toBe(true);
    });

    it("returns false for link entries", () => {
        expect(isNavGroup({ href: "/", label: "Home" })).toBe(false);
    });
});

describe("filterLinks", () => {
    it("keeps all non-auth links when logged out", () => {
        const result = filterLinks(
            [
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
            ],
            false,
        );
        expect(result).toEqual([
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
        ]);
    });

    it("removes auth-gated links when logged out", () => {
        const result = filterLinks(
            [
                { href: "/", label: "Home" },
                { href: "/secret", label: "Secret", auth: true },
            ],
            false,
        );
        expect(result).toEqual([{ href: "/", label: "Home" }]);
    });

    it("keeps auth-gated links when logged in", () => {
        const result = filterLinks(
            [
                { href: "/", label: "Home" },
                { href: "/secret", label: "Secret", auth: true },
            ],
            true,
        );
        expect(result).toEqual([
            { href: "/", label: "Home" },
            { href: "/secret", label: "Secret", auth: true },
        ]);
    });

    it("removes groups with no visible children when logged out", () => {
        const result = filterLinks(
            [
                { href: "/", label: "Home" },
                {
                    label: "Games",
                    children: [
                        {
                            href: "/games/x",
                            label: "Game X",
                            auth: true,
                        },
                    ],
                },
            ],
            false,
        );
        expect(result).toEqual([{ href: "/", label: "Home" }]);
    });

    it("preserves groups with at least one visible child", () => {
        const result = filterLinks(
            [
                {
                    label: "Games",
                    children: [
                        { href: "/games/public", label: "Public Game" },
                        {
                            href: "/games/private",
                            label: "Private Game",
                            auth: true,
                        },
                    ],
                },
            ],
            false,
        );
        expect(result).toEqual([
            {
                label: "Games",
                children: [{ href: "/games/public", label: "Public Game" }],
            },
        ]);
    });

    it("keeps all group children when logged in", () => {
        const result = filterLinks(
            [
                {
                    label: "Games",
                    children: [
                        { href: "/games/public", label: "Public Game" },
                        {
                            href: "/games/private",
                            label: "Private Game",
                            auth: true,
                        },
                    ],
                },
            ],
            true,
        );
        expect(result).toEqual([
            {
                label: "Games",
                children: [
                    { href: "/games/public", label: "Public Game" },
                    {
                        href: "/games/private",
                        label: "Private Game",
                        auth: true,
                    },
                ],
            },
        ]);
    });
});

describe("getSectionLinks", () => {
    it("returns admin links for exact /admin path", () => {
        const links = getSectionLinks("/admin");
        expect(links).toBeDefined();
        expect(links![0]).toHaveProperty("href", "/admin");
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
