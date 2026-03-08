import { Show, type JSX } from "solid-js";
import { requireAuth } from "~/auth/require-auth";
import type { NavLink } from "~/components/nav/nav-links";
import Spinner from "~/components/ui/Spinner";

export const navLinks: NavLink[] = [
    { href: "/admin", label: "Users" },
    {
        label: "Games",
        children: [
            { href: "/admin/scores", label: "Scores" },
            { href: "/admin/game-sessions", label: "Sessions" },
        ],
    },
    { href: "/admin/blog", label: "Blog" },
    {
        label: "Tools",
        children: [
            {
                href: "/admin/tools/create-test-users",
                label: "Create Test Users",
            },
        ],
    },
];

export default function AdminLayout(props: { children: JSX.Element }) {
    const { authorized } = requireAuth({
        permissions: {
            user: [
                "list",
                "set-role",
                "ban",
                "update",
                "delete",
                "set-password",
            ],
        },
    });

    return (
        <Show when={authorized()} fallback={<Spinner size="xl" center />}>
            {props.children}
        </Show>
    );
}
