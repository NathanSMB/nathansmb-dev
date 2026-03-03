import { createSignal, Show, onMount } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { getNextTestUserNumber } from "~/auth/test-users";
import Banner from "~/components/ui/Banner";
import Button from "~/components/ui/Button";
import Spinner from "~/components/ui/Spinner";
import Form from "~/components/ui/Form";
import FormLabel from "~/components/ui/FormLabel";
import ProgressBar from "~/components/ui/ProgressBar";
import Slider from "~/components/ui/Slider";
import "./test-users.css";

export default function TestUserGenerator() {
    const navigate = useNavigate();
    const [count, setCount] = createSignal(10);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [nextNumber, setNextNumber] = createSignal<number | null>(null);
    const [progress, setProgress] = createSignal<{
        current: number;
        total: number;
    } | null>(null);

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
        setProgress({ current: 0, total: count() });

        try {
            const response = await fetch("/api/admin/batch/create-test-users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count: count() }),
            });

            if (!response.ok) {
                setError(await response.text());
                setLoading(false);
                setProgress(null);
                return;
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                buffer = lines.pop()!;

                for (const line of lines) {
                    const match = line.match(/^data: (.+)$/m);
                    if (!match) continue;

                    const data = JSON.parse(match[1]);
                    if (data.done) {
                        if (data.created < count()) {
                            setError(
                                `Only ${data.created} of ${count()} users were created`,
                            );
                            setLoading(false);
                            setProgress(null);
                        } else {
                            navigate("/admin", { replace: true });
                        }
                    } else {
                        setProgress({
                            current: data.completed,
                            total: data.total,
                        });
                    }
                }
            }
        } catch {
            setError("Failed to create test users");
            setLoading(false);
            setProgress(null);
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

            <Show when={nextNumber() !== null} fallback={<Spinner size="lg" />}>
                <Banner
                    variant="info"
                    message={`Next test user: TestUser${nextNumber()} (testuser${nextNumber()}@example.com)`}
                />

                <Form onSubmit={handleSubmit}>
                    <FormLabel>
                        Number of users to create
                        <Slider
                            value={count()}
                            onInput={setCount}
                            min={1}
                            max={100}
                        />
                    </FormLabel>

                    <Show when={progress()}>
                        {(p) => (
                            <ProgressBar
                                current={p().current}
                                total={p().total}
                                label="created"
                            />
                        )}
                    </Show>

                    <Button type="submit" disabled={loading()}>
                        {loading()
                            ? `Creating... (${progress()?.current ?? 0}/${progress()?.total ?? count()})`
                            : `Create ${count()} test user(s)`}
                    </Button>
                </Form>
            </Show>
        </main>
    );
}
