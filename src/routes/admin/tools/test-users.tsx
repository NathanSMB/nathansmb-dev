import { createSignal, onMount } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { requireAuth } from "~/auth/require-auth";
import { getNextTestUserNumber, createTestUsers } from "~/auth/test-users";
import Banner from "~/components/ui/Banner";
import Button from "~/components/ui/Button";
import Form from "~/components/ui/Form";
import FormLabel from "~/components/ui/FormLabel";
import TextInput from "~/components/ui/TextInput";
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
    <main class="test-users-page">
      <Title>Generate Test Users</Title>
      <h1>Generate Test Users</h1>
      <p class="back-link">
        <a href="/admin">&larr; Back to admin</a>
      </p>

      <Banner variant="error" message={error()} />

      <Banner variant="info" message={nextNumber() !== null ? `Next test user: TestUser${nextNumber()} (testuser${nextNumber()}@example.com)` : undefined} />

      <Form onSubmit={handleSubmit}>
        <FormLabel>
          Number of users to create
          <TextInput
            type="number"
            min={1}
            max={100}
            value={String(count())}
            onInput={(v) => setCount(parseInt(v) || 1)}
            required
          />
        </FormLabel>
        <Button type="submit" disabled={loading()}>
          {loading() ? "Creating..." : `Create ${count()} test user(s)`}
        </Button>
      </Form>
    </main>
  );
}
