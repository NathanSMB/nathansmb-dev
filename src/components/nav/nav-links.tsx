import { navLinks as adminLinks } from "~/routes/admin";

export interface NavLink {
    href: string;
    label: string;
    auth?: boolean;
}

export const defaultLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/games/space-invaders", label: "Space Invaders", auth: true },
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
