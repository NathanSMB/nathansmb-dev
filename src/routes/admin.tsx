import { Show, type JSX } from "solid-js";
import { requireAuth } from "~/auth/require-auth";
import Spinner from "~/components/ui/Spinner";

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
        <Show when={authorized()} fallback={<Spinner size="xl" />}>
            {props.children}
        </Show>
    );
}
