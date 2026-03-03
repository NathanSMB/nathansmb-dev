import { createSignal, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { authClient } from "~/auth/auth-client";
import { requireAuth } from "~/auth/require-auth";
import Banner from "~/components/ui/Banner";
import Form from "~/components/ui/Form";
import FormLabel from "~/components/ui/FormLabel";
import TextInput from "~/components/ui/TextInput";
import Button from "~/components/ui/Button";
import "~/styles/page-narrow.css";

export default function PasswordSettings() {
    const { session, authorized } = requireAuth();

    const [currentPassword, setCurrentPassword] = createSignal("");
    const [newPassword, setNewPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal("");
    const [loading, setLoading] = createSignal(false);

    async function handleSubmit(e: Event) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword() !== confirmPassword()) {
            setError("New passwords do not match");
            return;
        }

        setLoading(true);

        const result = await authClient.changePassword({
            currentPassword: currentPassword(),
            newPassword: newPassword(),
        });

        setLoading(false);

        if (result.error) {
            setError(result.error.message ?? "Failed to change password");
        } else {
            setSuccess("Password changed");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    }

    return (
        <Show when={authorized()}>
            <main class="page-narrow">
                <Title>Change password</Title>
                <h1>Change password</h1>
                <Banner variant="error" message={error()} />
                <Banner variant="success" message={success()} />
                <Show when={session().data}>
                    <Form onSubmit={handleSubmit}>
                        <FormLabel>
                            Current password
                            <TextInput
                                type="password"
                                variant="form"
                                value={currentPassword()}
                                onInput={setCurrentPassword}
                                required
                            />
                        </FormLabel>
                        <FormLabel>
                            New password
                            <TextInput
                                type="password"
                                variant="form"
                                value={newPassword()}
                                onInput={setNewPassword}
                                required
                            />
                        </FormLabel>
                        <FormLabel>
                            Confirm new password
                            <TextInput
                                type="password"
                                variant="form"
                                value={confirmPassword()}
                                onInput={setConfirmPassword}
                                required
                            />
                        </FormLabel>
                        <Button
                            variant="form"
                            type="submit"
                            disabled={loading()}
                        >
                            {loading()
                                ? "Changing password..."
                                : "Change password"}
                        </Button>
                    </Form>
                    <p>
                        <a href="/settings/profile">Back to profile</a>
                    </p>
                </Show>
            </main>
        </Show>
    );
}
