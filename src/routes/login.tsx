import { createEffect, createSignal } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { authClient } from "~/auth/auth-client";
import Banner from "~/components/ui/Banner";

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
      navigate(redirect ? decodeURIComponent(redirect) : "/", { replace: true });
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
      navigate(redirect ? decodeURIComponent(redirect) : "/", { replace: true });
    }
  }

  return (
    <main class="auth-form">
      <Title>Log in</Title>
      <h1>Log in</h1>
      <Banner variant="error" message={error()} />
      <form onSubmit={handleSubmit}>
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
          Password
          <input
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading()}>
          {loading() ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p>
        Don't have an account? <a href="/register">Create one</a>
      </p>
    </main>
  );
}
