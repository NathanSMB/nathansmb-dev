import { createResource, For, Show, onMount, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import css from "./Leaderboard.css?inline";

interface LeaderboardEntry {
    id: string;
    score: number;
    wave: number;
    userName: string;
}

async function fetchScores(): Promise<LeaderboardEntry[]> {
    if (isServer) return [];
    const res = await fetch(
        "/api/games/leaderboard?game=cosmic-barrage&limit=10",
    );
    if (!res.ok) return [];
    return res.json();
}

export default function Leaderboard() {
    const [scores, { refetch }] = createResource(fetchScores);

    const onRefresh = () => refetch();

    onMount(() => {
        window.addEventListener("leaderboard-refresh", onRefresh);
    });

    onCleanup(() => {
        window.removeEventListener("leaderboard-refresh", onRefresh);
    });

    return (
        <>
            <style>{css}</style>
            <div class="cb-leaderboard">
                <div class="cb-leaderboard-title">TOP SCORES</div>
                <Show
                    when={scores()?.length}
                    fallback={
                        <div class="cb-leaderboard-empty">No scores yet</div>
                    }
                >
                    <ol class="cb-leaderboard-list">
                        <For each={scores()}>
                            {(entry, i) => (
                                <li class="cb-leaderboard-entry">
                                    <span class="cb-leaderboard-rank">
                                        {i() + 1}
                                    </span>
                                    <span class="cb-leaderboard-name">
                                        {entry.userName}
                                    </span>
                                    <span class="cb-leaderboard-score">
                                        {entry.score.toLocaleString()}
                                    </span>
                                </li>
                            )}
                        </For>
                    </ol>
                </Show>
            </div>
        </>
    );
}
