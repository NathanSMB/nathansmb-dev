import { createSignal, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { authClient } from "~/utils/auth-client";
import { requireAuth } from "~/utils/require-auth";

export default function PasswordSettings() {
  const session = requireAuth();

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
    <main class="auth-form">
      <Title>Change password</Title>
      <h1>Change password</h1>
      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>
      <Show when={success()}>
        <div class="success">{success()}</div>
      </Show>
      <Show when={session().data}>
        <form onSubmit={handleSubmit}>
          <label>
            Current password
            <input
              type="password"
              value={currentPassword()}
              onInput={(e) => setCurrentPassword(e.currentTarget.value)}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={newPassword()}
              onInput={(e) => setNewPassword(e.currentTarget.value)}
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading()}>
            {loading() ? "Changing password..." : "Change password"}
          </button>
        </form>
        <p>
          <a href="/settings/profile">Back to profile</a>
        </p>
      </Show>
    </main>
  );
}
