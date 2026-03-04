import { Show, type JSX } from "solid-js";
import { requireAuth } from "~/auth/require-auth";
import { NavLinksProvider } from "~/components/nav/nav-links";
import Spinner from "~/components/ui/Spinner";

const adminLinks = [
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
        <NavLinksProvider links={adminLinks}>
            <Show when={authorized()} fallback={<Spinner size="xl" center />}>
                {props.children}
            </Show>
        </NavLinksProvider>
    );
}
