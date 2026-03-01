import { createSignal, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { authClient } from "~/auth/auth-client";

export default function Register() {
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
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
    <main class="auth-form">
      <Title>Create account</Title>
      <h1>Create account</h1>
      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>
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
          Password
          <input
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading()}>
          {loading() ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </main>
  );
}
