import { onMount, onCleanup, createSignal, Show } from "solid-js";
import { TbOutlineMaximize, TbOutlineMinimize } from "solid-icons/tb";
import { authClient } from "~/auth/auth-client";
import type { GameStateSnapshot } from "./engine/types";
import { GameEngine } from "./engine/GameEngine";
import { PLAYER } from "./engine/constants";
import HUD from "./ui/HUD";
import StartScreen from "./ui/StartScreen";
import GameOverOverlay from "./ui/GameOverOverlay";
import HelpScreen from "./ui/HelpScreen";
import css from "./CosmicBarrageGame.css?inline";

const doc = () =>
    document as Document & {
        webkitFullscreenElement?: Element | null;
        webkitFullscreenEnabled?: boolean;
        webkitExitFullscreen?: () => Promise<void>;
    };

function getFullscreenElement(): Element | null {
    const d = doc();
    return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

function fsEnabled(): boolean {
    const d = doc();
    return !!(d.fullscreenEnabled ?? d.webkitFullscreenEnabled);
}

function requestFS(el: HTMLElement) {
    if (el.requestFullscreen) return el.requestFullscreen();
    const wk = el as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
    };
    if (wk.webkitRequestFullscreen) return wk.webkitRequestFullscreen();
}

function exitFS() {
    const d = doc();
    if (d.exitFullscreen) return d.exitFullscreen();
    if (d.webkitExitFullscreen) return d.webkitExitFullscreen();
}

interface CosmicBarrageGameProps {
    showLeaderboard?: boolean;
}

export default function CosmicBarrageGame(props: CosmicBarrageGameProps) {
    let canvasRef!: HTMLCanvasElement;
    let wrapperRef!: HTMLDivElement;
    let engine: GameEngine;

    const defaultState: GameStateSnapshot = {
        phase: "start",
        score: 0,
        wave: 1,
        hp: PLAYER.hp,
        maxHp: PLAYER.hp,
        shield: PLAYER.shield,
        maxShield: PLAYER.shield,
        activePowerUps: [],
        fps: 0,
    };

    const [gameState, setGameState] =
        createSignal<GameStateSnapshot>(defaultState);
    const [finalScore, setFinalScore] = createSignal(0);
    const [finalWave, setFinalWave] = createSignal(0);
    const [muted, setMuted] = createSignal(false);
    const [fullscreen, setFullscreen] = createSignal(false);
    const [cssFullscreen, setCssFullscreen] = createSignal(false);
    const useNativeFS = fsEnabled();
    const [sessionId, setSessionId] = createSignal<string | null>(null);
    const [sessionLoading, setSessionLoading] = createSignal(false);
    const [helpOpen, setHelpOpen] = createSignal(false);
    const session = authClient.useSession();

    function onFullscreenChange() {
        setFullscreen(!!getFullscreenElement());
        engine?.resize();
    }

    async function createGameSession(): Promise<boolean> {
        if (!session()?.data) return true;
        setSessionLoading(true);
        try {
            const res = await fetch("/api/games/session", { method: "POST" });
            if (res.ok) {
                const { sessionId } = await res.json();
                setSessionId(sessionId);
            }
            return true;
        } catch {
            return true;
        } finally {
            setSessionLoading(false);
        }
    }

    onMount(() => {
        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", onFullscreenChange);
        if (!useNativeFS) {
            window.addEventListener("keydown", onCssFullscreenKey);
        }
        engine = new GameEngine({
            onStateChange: (state) => setGameState(state),
            onGameOver: (score, wave) => {
                setFinalScore(score);
                setFinalWave(wave);
            },
            onStartRequested: () => {
                if (helpOpen()) return Promise.resolve(false);
                return createGameSession();
            },
        });
        engine.mount(canvasRef);
    });

    onCleanup(() => {
        document.removeEventListener("fullscreenchange", onFullscreenChange);
        document.removeEventListener(
            "webkitfullscreenchange",
            onFullscreenChange,
        );
        if (!useNativeFS) {
            window.removeEventListener("keydown", onCssFullscreenKey);
        }
        engine?.unmount();
    });

    async function handlePlayAgain() {
        await createGameSession();
        engine.startGame();
    }

    function handleScoreSubmitted() {
        window.dispatchEvent(new Event("leaderboard-refresh"));
    }

    function handleToggleMute() {
        const isMuted = engine.toggleMute();
        setMuted(isMuted);
    }

    function handleToggleFullscreen() {
        if (useNativeFS) {
            if (getFullscreenElement()) {
                exitFS();
            } else {
                requestFS(wrapperRef);
            }
        } else {
            const next = !cssFullscreen();
            setCssFullscreen(next);
            setFullscreen(next);
            engine?.resize();
        }
    }

    function onCssFullscreenKey(e: KeyboardEvent) {
        if (e.key === "Escape" && cssFullscreen()) {
            setCssFullscreen(false);
            setFullscreen(false);
            engine?.resize();
        }
    }

    return (
        <>
            <style>{css}</style>
            <div
                class={`cb-game-wrapper${cssFullscreen() ? " cb-css-fullscreen" : ""}`}
                ref={wrapperRef!}
            >
                <canvas ref={canvasRef!} class="cb-game-canvas" />

                <Show when={gameState().phase === "start"}>
                    <StartScreen loading={sessionLoading()} />
                </Show>

                <Show when={gameState().phase === "playing"}>
                    <HUD state={gameState()} />
                </Show>

                <Show when={gameState().phase === "game-over"}>
                    <GameOverOverlay
                        score={finalScore()}
                        wave={finalWave()}
                        gameSessionId={sessionId()}
                        onPlayAgain={handlePlayAgain}
                        onScoreSubmitted={handleScoreSubmitted}
                    />
                </Show>

                <Show when={helpOpen()}>
                    <HelpScreen onClose={() => setHelpOpen(false)} />
                </Show>

                <div class="cb-btn-row">
                    <Show when={gameState().phase === "start"}>
                        <button
                            class="cb-ctrl-btn"
                            onClick={() => setHelpOpen(true)}
                        >
                            HELP
                        </button>
                    </Show>
                    <button class="cb-ctrl-btn" onClick={handleToggleMute}>
                        {muted() ? "UNMUTE" : "MUTE"}
                    </button>
                    <button
                        class="cb-ctrl-btn"
                        onClick={handleToggleFullscreen}
                    >
                        {fullscreen() ? (
                            <TbOutlineMinimize />
                        ) : (
                            <TbOutlineMaximize />
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
