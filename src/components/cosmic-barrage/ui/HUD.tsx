import { For, Show } from "solid-js";
import type { GameStateSnapshot } from "../engine/types";
import css from "./HUD.css?inline";

interface HUDProps {
    state: GameStateSnapshot;
}

const POWERUP_LABELS: Record<string, string> = {
    "rapid-fire": "RAPID",
    "spread-shot": "SPREAD",
    "score-multiplier": "2x",
    piercing: "PIERCE",
};

export default function HUD(props: HUDProps) {
    return (
        <>
            <style>{css}</style>
            <div class="cb-hud">
                <div class="cb-hud-left">
                    <div class="cb-hud-score">
                        {props.state.score.toLocaleString()}
                    </div>
                    <div class="cb-hud-wave">WAVE {props.state.wave}</div>
                </div>
                <div class="cb-hud-right">
                    <div class="cb-hud-bar">
                        <span>HP</span>
                        <div class="cb-hud-bar-track">
                            <div
                                class="cb-hud-bar-fill cb-hud-bar-fill--hp"
                                style={{
                                    width: `${(props.state.hp / props.state.maxHp) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                    <div class="cb-hud-bar">
                        <span>SH</span>
                        <div class="cb-hud-bar-track">
                            <div
                                class="cb-hud-bar-fill cb-hud-bar-fill--shield"
                                style={{
                                    width: `${(props.state.shield / props.state.maxShield) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                    <Show when={props.state.activePowerUps.length > 0}>
                        <div class="cb-hud-powerups">
                            <For each={props.state.activePowerUps}>
                                {(pu) => (
                                    <span
                                        class={`cb-hud-powerup cb-hud-powerup--${pu.type}`}
                                    >
                                        {POWERUP_LABELS[pu.type] ?? pu.type}
                                    </span>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </div>
        </>
    );
}
