import { createEffect, createSignal, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { authClient } from "~/auth/auth-client";
import Banner from "~/components/ui/Banner";
import Form from "~/components/ui/Form";
import FormLabel from "~/components/ui/FormLabel";
import TextInput from "~/components/ui/TextInput";
import Button from "~/components/ui/Button";
import Spinner from "~/components/ui/Spinner";
import "~/styles/page-narrow.css";

export default function Login() {
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [error, setError] = createSignal("");
    const [loading, setLoading] = createSignal(false);
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

    async function handleSubmit(e: Event) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await authClient.signIn.email({
            email: email(),
            password: password(),
        });

        setLoading(false);

        if (result.error) {
            setError(result.error.message ?? "Login failed");
        } else {
            const redirect = searchParams.redirect as string | undefined;
            navigate(redirect ? decodeURIComponent(redirect) : "/", {
                replace: true,
            });
        }
    }

    return (
        <Show
            when={!session().isPending && !session().data}
            fallback={<Spinner size="lg" />}
        >
            <main class="page-narrow">
                <Title>Log in</Title>
                <h1>Log in</h1>
                <Banner variant="error" message={error()} />
                <Form onSubmit={handleSubmit}>
                    <FormLabel>
                        Email
                        <TextInput
                            type="email"
                            variant="form"
                            value={email()}
                            onInput={setEmail}
                            required
                        />
                    </FormLabel>
                    <FormLabel>
                        Password
                        <TextInput
                            type="password"
                            variant="form"
                            value={password()}
                            onInput={setPassword}
                            required
                        />
                    </FormLabel>
                    <Button variant="form" type="submit" disabled={loading()}>
                        {loading() ? "Logging in..." : "Log in"}
                    </Button>
                </Form>
                <p>
                    Don't have an account? <a href="/register">Create one</a>
                </p>
            </main>
        </Show>
    );
}
