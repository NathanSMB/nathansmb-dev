import { createEffect, Show, type JSX } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { authClient } from "~/auth/auth-client";
import Spinner from "~/components/ui/Spinner";
import "~/styles/page-narrow.css";

export default function AuthLayout(props: { children: JSX.Element }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const session = authClient.useSession();

    createEffect(() => {
        if (session().isPending) return;
        if (session().data) {
            const redirect = searchParams.redirect as string | undefined;
            navigate(redirect ? decodeURIComponent(redirect) : "/", {
                replace: true,
            });
        }
    });

    return (
        <Show
            when={!session().isPending && !session().data}
            fallback={<Spinner size="xl" center />}
        >
            {props.children}
        </Show>
    );
}
