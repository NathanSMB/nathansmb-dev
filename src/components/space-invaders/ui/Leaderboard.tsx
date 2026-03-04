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
        "/api/games/leaderboard?game=space-invaders&limit=10",
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
            <div class="si-leaderboard">
                <div class="si-leaderboard-title">TOP SCORES</div>
                <Show
                    when={scores()?.length}
                    fallback={
                        <div class="si-leaderboard-empty">No scores yet</div>
                    }
                >
                    <ol class="si-leaderboard-list">
                        <For each={scores()}>
                            {(entry, i) => (
                                <li class="si-leaderboard-entry">
                                    <span class="si-leaderboard-rank">
                                        {i() + 1}
                                    </span>
                                    <span class="si-leaderboard-name">
                                        {entry.userName}
                                    </span>
                                    <span class="si-leaderboard-score">
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
