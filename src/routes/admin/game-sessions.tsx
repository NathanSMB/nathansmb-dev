import { createSignal, createEffect, on, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import {
    SessionTable,
    type SessionRow,
} from "~/components/admin/session-table";
import { Pagination } from "~/components/admin/table";
import ConfirmModal from "~/components/ui/ConfirmModal";
import Button from "~/components/ui/Button";
import Banner from "~/components/ui/Banner";
import Spinner from "~/components/ui/Spinner";
import "./admin.css";

export default function AdminGameSessions() {
    const [sessions, setSessions] = createSignal<SessionRow[]>([]);
    const [total, setTotal] = createSignal(0);
    const [staleCount, setStaleCount] = createSignal(0);
    const [page, setPage] = createSignal(0);
    const [pageSize, setPageSize] = createSignal(10);
    const [sortBy, setSortBy] = createSignal("startedAt");
    const [sortDirection, setSortDirection] = createSignal<"asc" | "desc">(
        "desc",
    );
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal("");
    const [showCleanup, setShowCleanup] = createSignal(false);
    const [cleanupLoading, setCleanupLoading] = createSignal(false);

    const totalPages = () => Math.max(1, Math.ceil(total() / pageSize()));

    async function fetchSessions() {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
            limit: String(pageSize()),
            offset: String(page() * pageSize()),
            sortBy: sortBy(),
            sortDirection: sortDirection(),
        });

        try {
            const res = await fetch(`/api/admin/game-sessions?${params}`);
            if (!res.ok) throw new Error("Failed to load sessions");
            const data = await res.json();
            setSessions(data.sessions);
            setTotal(data.total);
            setStaleCount(data.staleCount);
        } catch (e: any) {
            setError(e.message ?? "Failed to load sessions");
        } finally {
            setLoading(false);
        }
    }

    createEffect(
        on([page, pageSize, sortBy, sortDirection], () => fetchSessions()),
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

    async function confirmCleanup() {
        setCleanupLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch("/api/admin/game-sessions/cleanup", {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to clean up sessions");
            const data = await res.json();
            setSuccess(`Deleted ${data.deletedCount} stale session(s)`);
            setPage(0);
            fetchSessions();
        } catch (e: any) {
            setError(e.message ?? "Failed to clean up sessions");
        } finally {
            setCleanupLoading(false);
            setShowCleanup(false);
        }
    }

    return (
        <main class="admin-page">
            <Title>Game session management</Title>
            <h1>Game session management</h1>

            <Banner variant="error" message={error()} />
            <Banner variant="success" message={success()} />

            <div class="admin-toolbar">
                <Button
                    color="danger"
                    disabled={staleCount() === 0}
                    onClick={() => setShowCleanup(true)}
                >
                    Delete {staleCount()} session(s) older than 1 day
                </Button>
            </div>

            <Show when={!loading()} fallback={<Spinner size="lg" />}>
                <SessionTable
                    sessions={sessions()}
                    sortBy={sortBy()}
                    sortDirection={sortDirection()}
                    onSort={handleSort}
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
                open={showCleanup()}
                title="Clean Up Stale Sessions"
                message="This will permanently delete all game sessions older than 1 day."
                details={`${staleCount()} session(s) will be deleted.`}
                confirmLabel={`Yes, delete ${staleCount()} session(s)`}
                onConfirm={confirmCleanup}
                onCancel={() => setShowCleanup(false)}
                loading={cleanupLoading()}
            />
        </main>
    );
}
