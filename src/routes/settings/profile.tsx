import { createEffect, createResource, createSignal, Show } from "solid-js";
import Avatar from "~/components/ui/Avatar";
import { Title } from "@solidjs/meta";
import { authClient } from "~/auth/auth-client";
import { requireAuth } from "~/auth/require-auth";
import { checkHasAdmins, promoteToAdmin } from "~/auth/admin-bootstrap";
import Banner from "~/components/ui/Banner";
import Form from "~/components/ui/Form";
import FormLabel from "~/components/ui/FormLabel";
import TextInput from "~/components/ui/TextInput";
import Button from "~/components/ui/Button";
import "~/styles/page-narrow.css";
import "./profile.css";

export default function ProfileSettings() {
    const { session, authorized } = requireAuth();

    const [name, setName] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [image, setImage] = createSignal("");
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal("");
    const [loading, setLoading] = createSignal(false);

    const [hasAdmins, { refetch: refetchAdmins }] = createResource(
        () => session().data,
        () => checkHasAdmins(),
    );

    async function handleBecomeAdmin() {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await promoteToAdmin();
            setSuccess("You are now an admin");
            refetchAdmins();
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Failed to become admin",
            );
        } finally {
            setLoading(false);
        }
    }

    createEffect(async () => {
        if (hasAdmins() === null) {
            await authClient.signOut();
        }
    });

    createEffect(() => {
        const user = session().data?.user;
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setImage(user.image ?? "");
        }
    });

    async function handleSubmit(e: Event) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        const user = session().data?.user;
        if (!user) return;

        const updates: { name?: string; image?: string | null } = {};
        if (name() !== user.name) updates.name = name();
        if ((image() || null) !== (user.image || null)) {
            updates.image = image() || null;
        }

        if (Object.keys(updates).length > 0) {
            const result = await authClient.updateUser(updates);
            if (result.error) {
                setError(result.error.message ?? "Failed to update profile");
                setLoading(false);
                return;
            }
        }

        if (email() !== user.email) {
            const result = await authClient.changeEmail({ newEmail: email() });
            if (result.error) {
                setError(result.error.message ?? "Failed to update email");
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        setSuccess("Profile updated");
    }

    return (
        <Show when={authorized()}>
            <main class="page-narrow">
                <Title>Profile settings</Title>
                <h1>Profile settings</h1>
                <Banner variant="error" message={error()} />
                <Banner variant="success" message={success()} />
                <Show when={session().data}>
                    <Form onSubmit={handleSubmit}>
                        <FormLabel>
                            Name
                            <TextInput
                                variant="form"
                                value={name()}
                                onInput={setName}
                                required
                            />
                        </FormLabel>
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
                            Profile image URL
                            <div class="image-field">
                                <Avatar
                                    image={image()}
                                    name={name()}
                                    size="lg"
                                />
                                <TextInput
                                    type="url"
                                    variant="form"
                                    value={image()}
                                    onInput={setImage}
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>
                        </FormLabel>
                        <Button
                            variant="form"
                            type="submit"
                            disabled={loading()}
                        >
                            {loading() ? "Saving..." : "Save changes"}
                        </Button>
                    </Form>
                    <Show when={hasAdmins() === false}>
                        <div>
                            <p>
                                No administrators exist yet. You can claim the
                                admin role.
                            </p>
                            <Button
                                type="button"
                                onClick={handleBecomeAdmin}
                                disabled={loading()}
                            >
                                {loading() ? "Promoting..." : "Become Admin"}
                            </Button>
                        </div>
                    </Show>
                    <p>
                        <a href="/settings/password">Change password</a>
                    </p>
                </Show>
            </main>
        </Show>
    );
}
