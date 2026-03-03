import { Show, type JSX } from "solid-js";
import { requireAuth } from "~/auth/require-auth";
import Spinner from "~/components/ui/Spinner";

export default function SettingsLayout(props: { children: JSX.Element }) {
    const { authorized } = requireAuth();

    return (
        <Show when={authorized()} fallback={<Spinner size="lg" />}>
            {props.children}
        </Show>
    );
}
