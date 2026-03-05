import { Show, createSignal } from "solid-js";
import { authClient } from "~/auth/auth-client";
import css from "./GameOverOverlay.css?inline";

interface GameOverOverlayProps {
    score: number;
    wave: number;
    gameSessionId: string | null;
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
                    game: "cosmic-barrage",
                    score: props.score,
                    wave: props.wave,
                    gameSessionId: props.gameSessionId,
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
            <div class="cb-gameover">
                <div class="cb-gameover-title">GAME OVER</div>
                <div class="cb-gameover-score">
                    {props.score.toLocaleString()}
                </div>
                <div class="cb-gameover-wave">WAVE {props.wave}</div>
                <div class="cb-gameover-actions">
                    <Show
                        when={session()?.data}
                        fallback={
                            <a
                                class="cb-gameover-login"
                                href="/login?redirect=/games/cosmic-barrage"
                            >
                                Log in to submit score
                            </a>
                        }
                    >
                        <Show
                            when={!submitted()}
                            fallback={
                                <button
                                    class="cb-gameover-btn cb-gameover-btn--submitted"
                                    disabled
                                >
                                    Score Submitted
                                </button>
                            }
                        >
                            <button
                                class="cb-gameover-btn cb-gameover-btn--submit"
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
                        class="cb-gameover-btn cb-gameover-btn--play"
                        onClick={props.onPlayAgain}
                    >
                        Play Again
                    </button>
                </div>
            </div>
        </>
    );
}
