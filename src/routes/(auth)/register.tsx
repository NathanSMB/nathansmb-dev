import { createSignal } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { authClient } from "~/auth/auth-client";
import Banner from "~/components/ui/Banner";
import Form from "~/components/ui/Form";
import FormLabel from "~/components/ui/FormLabel";
import TextInput from "~/components/ui/TextInput";
import Button from "~/components/ui/Button";

export default function Register() {
    const [name, setName] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [error, setError] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const navigate = useNavigate();

    async function handleSubmit(e: Event) {
        e.preventDefault();
        setError("");

        if (password() !== confirmPassword()) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        const result = await authClient.signUp.email({
            email: email(),
            password: password(),
            name: name(),
        });

        setLoading(false);

        if (result.error) {
            setError(result.error.message ?? "Registration failed");
        } else {
            navigate("/", { replace: true });
        }
    }

    return (
        <main class="page-narrow">
            <Title>Create account</Title>
            <h1>Create account</h1>
            <Banner variant="error" message={error()} />
            <Form onSubmit={handleSubmit}>
                <FormLabel>
                    Name
                    <TextInput
                        size="lg"
                        color="surface"
                        value={name()}
                        onInput={setName}
                        required
                    />
                </FormLabel>
                <FormLabel>
                    Email
                    <TextInput
                        type="email"
                        size="lg"
                        color="surface"
                        value={email()}
                        onInput={setEmail}
                        required
                    />
                </FormLabel>
                <FormLabel>
                    Password
                    <TextInput
                        type="password"
                        size="lg"
                        color="surface"
                        value={password()}
                        onInput={setPassword}
                        required
                    />
                </FormLabel>
                <FormLabel>
                    Confirm password
                    <TextInput
                        type="password"
                        size="lg"
                        color="surface"
                        value={confirmPassword()}
                        onInput={setConfirmPassword}
                        required
                    />
                </FormLabel>
                <Button
                    size="lg"
                    class="form-submit"
                    type="submit"
                    disabled={loading()}
                >
                    {loading() ? "Creating account..." : "Create account"}
                </Button>
            </Form>
            <p>
                Already have an account? <a href="/login">Log in</a>
            </p>
        </main>
    );
}
