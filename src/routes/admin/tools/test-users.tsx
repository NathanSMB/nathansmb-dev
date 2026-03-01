import { createSignal, Show, onMount } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { requireAuth } from "~/auth/require-auth";
import { getNextTestUserNumber, createTestUsers } from "~/auth/test-users";
import Button from "~/components/ui/Button";
import "./test-users.css";

export default function TestUserGenerator() {
  requireAuth({
    permissions: { user: ["list"] },
  });

  const navigate = useNavigate();
  const [count, setCount] = createSignal(10);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [nextNumber, setNextNumber] = createSignal<number | null>(null);

  onMount(async () => {
    try {
      const num = await getNextTestUserNumber();
      setNextNumber(num);
    } catch {
      setError("Failed to determine next test user number");
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createTestUsers(count());
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        navigate("/admin", { replace: true });
      }
    } catch {
      setError("Failed to create test users");
      setLoading(false);
    }
  }

  return (
    <>
      <main class="test-users-page">
      <Title>Generate Test Users</Title>
      <h1>Generate Test Users</h1>
      <p class="back-link">
        <a href="/admin">&larr; Back to admin</a>
      </p>

      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>

      <Show when={nextNumber() !== null}>
        <p class="info">
          Next test user: TestUser{nextNumber()} (testuser{nextNumber()}@example.com)
        </p>
      </Show>

      <form onSubmit={handleSubmit}>
        <label>
          Number of users to create
          <input
            type="number"
            min="1"
            max="100"
            value={count()}
            onInput={(e) => setCount(parseInt(e.currentTarget.value) || 1)}
            required
          />
        </label>
        <Button variant="primary" type="submit" disabled={loading()}>
          {loading() ? "Creating..." : `Create ${count()} test user(s)`}
        </Button>
      </form>
    </main>
    </>
  );
}
