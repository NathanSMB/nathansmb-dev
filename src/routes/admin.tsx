import { Show, type JSX } from "solid-js";
import { requireAuth } from "~/auth/require-auth";
import type { NavLink } from "~/components/nav/nav-links";
import Spinner from "~/components/ui/Spinner";

export const navLinks: NavLink[] = [
    { href: "/admin", label: "Users" },
    { href: "/admin/tools/test-users", label: "Test Users" },
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
