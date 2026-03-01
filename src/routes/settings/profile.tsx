import { createEffect, createSignal, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { authClient } from "~/utils/auth-client";
import { requireAuth } from "~/utils/require-auth";

export default function ProfileSettings() {
  const session = requireAuth();

  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [image, setImage] = createSignal("");
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const [loading, setLoading] = createSignal(false);

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
    <main class="auth-form">
      <Title>Profile settings</Title>
      <h1>Profile settings</h1>
      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>
      <Show when={success()}>
        <div class="success">{success()}</div>
      </Show>
      <Show when={session().data}>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
            />
          </label>
          <label>
            Profile image URL
            <div class="image-field">
              <Show when={image()}>
                <img src={image()} alt="" class="avatar avatar-lg" />
              </Show>
              <input
                type="url"
                value={image()}
                onInput={(e) => setImage(e.currentTarget.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </label>
          <button type="submit" disabled={loading()}>
            {loading() ? "Saving..." : "Save changes"}
          </button>
        </form>
        <p>
          <a href="/settings/password">Change password</a>
        </p>
      </Show>
    </main>
  );
}
