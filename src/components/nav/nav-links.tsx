import { navLinks as adminLinks } from "~/routes/admin";

export interface NavLinkItem {
    href: string;
    label: string;
    auth?: boolean;
}

export interface NavLinkGroup {
    label: string;
    children: NavLinkItem[];
}

export type NavLink = NavLinkItem | NavLinkGroup;

export function isNavGroup(link: NavLink): link is NavLinkGroup {
    return "children" in link;
}

export function filterLinks(links: NavLink[], loggedIn: boolean): NavLink[] {
    const result: NavLink[] = [];
    for (const link of links) {
        if (isNavGroup(link)) {
            const filtered = link.children.filter((c) => !c.auth || loggedIn);
            if (filtered.length > 0) {
                result.push({ ...link, children: filtered });
            }
        } else {
            if (!link.auth || loggedIn) result.push(link);
        }
    }
    return result;
}

export const defaultLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    {
        label: "Games",
        children: [
            {
                href: "/games/cosmic-barrage",
                label: "Cosmic Barrage",
                auth: true,
            },
        ],
    },
];

const sectionLinksConfig: { prefix: string; links: NavLink[] }[] = [
    { prefix: "/admin", links: adminLinks },
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
