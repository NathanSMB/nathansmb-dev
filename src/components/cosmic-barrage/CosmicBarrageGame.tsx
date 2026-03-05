import { onMount, onCleanup, createSignal, Show } from "solid-js";
import { TbOutlineMaximize, TbOutlineMinimize } from "solid-icons/tb";
import type { GameStateSnapshot } from "./engine/types";
import { GameEngine } from "./engine/GameEngine";
import { PLAYER } from "./engine/constants";
import HUD from "./ui/HUD";
import StartScreen from "./ui/StartScreen";
import GameOverOverlay from "./ui/GameOverOverlay";
import Leaderboard from "./ui/Leaderboard";
import css from "./CosmicBarrageGame.css?inline";

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
    };

    const [gameState, setGameState] =
        createSignal<GameStateSnapshot>(defaultState);
    const [finalScore, setFinalScore] = createSignal(0);
    const [finalWave, setFinalWave] = createSignal(0);
    const [leaderboardKey, setLeaderboardKey] = createSignal(0);
    const [muted, setMuted] = createSignal(false);
    const [fullscreen, setFullscreen] = createSignal(false);

    function onFullscreenChange() {
        setFullscreen(!!document.fullscreenElement);
        engine?.resize();
    }

    onMount(() => {
        document.addEventListener("fullscreenchange", onFullscreenChange);
        engine = new GameEngine({
            onStateChange: (state) => setGameState(state),
            onGameOver: (score, wave) => {
                setFinalScore(score);
                setFinalWave(wave);
            },
        });
        engine.mount(canvasRef);
    });

    onCleanup(() => {
        document.removeEventListener("fullscreenchange", onFullscreenChange);
        engine?.unmount();
    });

    function handlePlayAgain() {
        engine.startGame();
    }

    function handleScoreSubmitted() {
        setLeaderboardKey((k) => k + 1);
    }

    function handleToggleMute() {
        const isMuted = engine.toggleMute();
        setMuted(isMuted);
    }

    function handleToggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            wrapperRef.requestFullscreen();
        }
    }

    return (
        <>
            <style>{css}</style>
            <div class="cb-game-wrapper" ref={wrapperRef!}>
                <canvas ref={canvasRef!} class="cb-game-canvas" />

                <Show when={gameState().phase === "start"}>
                    <StartScreen />
                </Show>

                <Show when={gameState().phase === "playing"}>
                    <HUD state={gameState()} />
                </Show>

                <Show when={gameState().phase === "game-over"}>
                    <GameOverOverlay
                        score={finalScore()}
                        wave={finalWave()}
                        onPlayAgain={handlePlayAgain}
                        onScoreSubmitted={handleScoreSubmitted}
                    />
                </Show>

                <div class="cb-btn-row">
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
