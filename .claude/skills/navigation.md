# Navigation

The nav system is defined in `src/components/nav/nav-links.tsx`.

## Types

```tsx
interface NavLinkItem {
    href: string;
    label: string;
    auth?: boolean; // if true, only shown to logged-in users
}

interface NavLinkGroup {
    label: string;
    children: NavLinkItem[]; // renders as a dropdown
}

type NavLink = NavLinkItem | NavLinkGroup;
```

## Adding a Default Link

Add to the `defaultLinks` array in `src/components/nav/nav-links.tsx`:

```tsx
export const defaultLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/new-page", label: "New Page" }, // ← add here
];
```

## Adding an Auth-Gated Link

Set `auth: true` — the link only appears for logged-in users:

```tsx
{ href: "/dashboard", label: "Dashboard", auth: true },
```

## Creating a Link Group (Dropdown)

Use `NavLinkGroup` with a `children` array:

```tsx
{
    label: "Games",
    children: [
        { href: "/games/cosmic-barrage", label: "Cosmic Barrage", auth: true },
        { href: "/games/tetris", label: "Tetris" },
    ],
},
```

Groups with no visible children (all auth-gated and user logged out) are automatically hidden by `filterLinks()`.

## Section-Specific Links

Layouts can export their own `navLinks` that replace the default links when the user is in that section.

### 1. Export `navLinks` from a layout file

```tsx
// src/routes/admin.tsx
import type { NavLink } from "~/components/nav/nav-links";

export const navLinks: NavLink[] = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Users" },
];
```

### 2. Register in `sectionLinksConfig`

In `src/components/nav/nav-links.tsx`:

```tsx
import { navLinks as adminLinks } from "~/routes/admin";

const sectionLinksConfig: { prefix: string; links: NavLink[] }[] = [
    { prefix: "/admin", links: adminLinks },
    // { prefix: "/dashboard", links: dashboardLinks },  ← add new sections here
];
```

`getSectionLinks(pathname)` finds the best matching section by longest prefix match.

## Utility Functions

| Function                       | Purpose                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `isNavGroup(link)`             | Type guard — returns `true` if the link is a `NavLinkGroup`                      |
| `filterLinks(links, loggedIn)` | Removes auth-gated links/groups when user is not logged in                       |
| `getSectionLinks(pathname)`    | Returns section-specific links for the current route, or `undefined` for default |
