import { createResource, For, Show, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import css from "./Leaderboard.css?inline";

interface LeaderboardEntry {
    id: string;
    score: number;
    wave: number;
    userName: string;
}

interface LeaderboardProps {
    refreshSignal?: number;
}

async function fetchScores(): Promise<LeaderboardEntry[]> {
    if (isServer) return [];
    const res = await fetch(
        "/api/games/leaderboard?game=cosmic-barrage&limit=10",
    );
    if (!res.ok) return [];
    return res.json();
}

export default function Leaderboard(props: LeaderboardProps) {
    const [scores, { refetch }] = createResource(fetchScores);

    const refresh = () => refetch();

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

export { type LeaderboardProps };
