export interface NavLink {
    href: string;
    label: string;
}

const sectionLinksConfig: { prefix: string; links: NavLink[] }[] = [
    {
        prefix: "/admin",
        links: [
            { href: "/admin", label: "Users" },
            { href: "/admin/tools/test-users", label: "Test Users" },
        ],
    },
];

export function getSectionLinks(pathname: string): NavLink[] | undefined {
    let best: NavLink[] | undefined;
    let bestLen = 0;
    for (const { prefix, links } of sectionLinksConfig) {
        if (
            prefix.length > bestLen &&
            (pathname === prefix || pathname.startsWith(prefix + "/"))
        ) {
            best = links;
            bestLen = prefix.length;
        }
    }
    return best;
}
