import { createSignal, createEffect, on, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { ScoreTable, type ScoreRow } from "~/components/admin/score-table";
import { Pagination } from "~/components/admin/table";
import ConfirmModal from "~/components/ui/ConfirmModal";
import Button from "~/components/ui/Button";
import Form from "~/components/ui/Form";
import TextInput from "~/components/ui/TextInput";
import Banner from "~/components/ui/Banner";
import Spinner from "~/components/ui/Spinner";
import "./admin.css";

export default function AdminScores() {
    const [scores, setScores] = createSignal<ScoreRow[]>([]);
    const [total, setTotal] = createSignal(0);
    const [page, setPage] = createSignal(0);
    const [pageSize, setPageSize] = createSignal(10);
    const [search, setSearch] = createSignal("");
    const [sortBy, setSortBy] = createSignal("createdAt");
    const [sortDirection, setSortDirection] = createSignal<"asc" | "desc">(
        "desc",
    );
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal("");
    const [deleteTarget, setDeleteTarget] = createSignal<{
        scoreId: string;
        playerName: string;
        score: number;
    } | null>(null);
    const [deleteLoading, setDeleteLoading] = createSignal(false);

    const totalPages = () => Math.max(1, Math.ceil(total() / pageSize()));

    async function fetchScores() {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
            limit: String(pageSize()),
            offset: String(page() * pageSize()),
            sortBy: sortBy(),
            sortDirection: sortDirection(),
        });
        if (search()) params.set("search", search());

        try {
            const res = await fetch(`/api/admin/scores?${params}`);
            if (!res.ok) throw new Error("Failed to load scores");
            const data = await res.json();
            setScores(data.scores);
            setTotal(data.total);
        } catch (e: any) {
            setError(e.message ?? "Failed to load scores");
        } finally {
            setLoading(false);
        }
    }

    createEffect(
        on([page, pageSize, sortBy, sortDirection], () => fetchScores()),
    );

    function handleSort(field: string) {
        if (sortBy() === field) {
            setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortDirection("asc");
        }
        setPage(0);
    }

    function handleSearch(e: Event) {
        e.preventDefault();
        setPage(0);
        fetchScores();
    }

    async function confirmDelete() {
        const target = deleteTarget();
        if (!target) return;

        setDeleteLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/admin/scores", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scoreId: target.scoreId }),
            });
            if (!res.ok) throw new Error("Failed to delete score");

            setSuccess("Score deleted");
            setScores((prev) => prev.filter((s) => s.id !== target.scoreId));
            setTotal((prev) => prev - 1);
        } catch (e: any) {
            setError(e.message ?? "Failed to delete score");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    }

    return (
        <main class="admin-page">
            <Title>Score management</Title>
            <h1>Score management</h1>

            <Banner variant="error" message={error()} />
            <Banner variant="success" message={success()} />

            <div class="admin-toolbar">
                <Form
                    variant="inline"
                    class="admin-search-form"
                    onSubmit={handleSearch}
                >
                    <TextInput
                        variant="toolbar"
                        placeholder="Search by player name..."
                        value={search()}
                        onInput={setSearch}
                    />
                    <Button type="submit">Search</Button>
                </Form>
            </div>

            <Show when={!loading()} fallback={<Spinner size="lg" />}>
                <ScoreTable
                    scores={scores()}
                    sortBy={sortBy()}
                    sortDirection={sortDirection()}
                    onSort={handleSort}
                    onDelete={(scoreId, playerName, score) =>
                        setDeleteTarget({ scoreId, playerName, score })
                    }
                />
                <Pagination
                    page={page()}
                    totalPages={totalPages()}
                    hasPrevious={page() > 0}
                    hasNext={(page() + 1) * pageSize() < total()}
                    pageSize={pageSize()}
                    onFirst={() => setPage(0)}
                    onPrevious={() => setPage((p) => p - 1)}
                    onNext={() => setPage((p) => p + 1)}
                    onLast={() => setPage(totalPages() - 1)}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(0);
                    }}
                />
            </Show>

            <ConfirmModal
                open={deleteTarget() !== null}
                title="Delete Score"
                message="This will permanently remove this score from the leaderboard."
                details={
                    deleteTarget()
                        ? `Player: ${deleteTarget()!.playerName} | Score: ${deleteTarget()!.score.toLocaleString()}`
                        : ""
                }
                confirmLabel="Yes, delete this score"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteLoading()}
            />
        </main>
    );
}
