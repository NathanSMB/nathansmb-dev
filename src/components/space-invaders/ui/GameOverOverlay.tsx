import { Show, createSignal } from "solid-js";
import { authClient } from "~/auth/auth-client";
import css from "./GameOverOverlay.css?inline";

interface GameOverOverlayProps {
    score: number;
    wave: number;
    onPlayAgain: () => void;
    onScoreSubmitted: () => void;
}

export default function GameOverOverlay(props: GameOverOverlayProps) {
    const session = authClient.useSession();
    const [submitted, setSubmitted] = createSignal(false);
    const [submitting, setSubmitting] = createSignal(false);

    async function submitScore() {
        if (submitted() || submitting()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/games/leaderboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    game: "space-invaders",
                    score: props.score,
                    wave: props.wave,
                }),
            });
            if (res.ok) {
                setSubmitted(true);
                props.onScoreSubmitted();
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <style>{css}</style>
            <div class="si-gameover">
                <div class="si-gameover-title">GAME OVER</div>
                <div class="si-gameover-score">
                    {props.score.toLocaleString()}
                </div>
                <div class="si-gameover-wave">WAVE {props.wave}</div>
                <div class="si-gameover-actions">
                    <Show
                        when={session()?.data}
                        fallback={
                            <a
                                class="si-gameover-login"
                                href="/login?redirect=/games/space-invaders"
                            >
                                Log in to submit score
                            </a>
                        }
                    >
                        <Show
                            when={!submitted()}
                            fallback={
                                <button
                                    class="si-gameover-btn si-gameover-btn--submitted"
                                    disabled
                                >
                                    Score Submitted
                                </button>
                            }
                        >
                            <button
                                class="si-gameover-btn si-gameover-btn--submit"
                                onClick={submitScore}
                                disabled={submitting()}
                            >
                                {submitting()
                                    ? "Submitting..."
                                    : "Submit Score"}
                            </button>
                        </Show>
                    </Show>
                    <button
                        class="si-gameover-btn si-gameover-btn--play"
                        onClick={props.onPlayAgain}
                    >
                        Play Again
                    </button>
                </div>
            </div>
        </>
    );
}
