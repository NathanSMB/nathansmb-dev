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
            <div class="si-hud">
                <div class="si-hud-left">
                    <div class="si-hud-score">
                        {props.state.score.toLocaleString()}
                    </div>
                    <div class="si-hud-wave">WAVE {props.state.wave}</div>
                </div>
                <div class="si-hud-right">
                    <div class="si-hud-bar">
                        <span>HP</span>
                        <div class="si-hud-bar-track">
                            <div
                                class="si-hud-bar-fill si-hud-bar-fill--hp"
                                style={{
                                    width: `${(props.state.hp / props.state.maxHp) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                    <div class="si-hud-bar">
                        <span>SH</span>
                        <div class="si-hud-bar-track">
                            <div
                                class="si-hud-bar-fill si-hud-bar-fill--shield"
                                style={{
                                    width: `${(props.state.shield / props.state.maxShield) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                    <Show when={props.state.activePowerUps.length > 0}>
                        <div class="si-hud-powerups">
                            <For each={props.state.activePowerUps}>
                                {(pu) => (
                                    <span
                                        class={`si-hud-powerup si-hud-powerup--${pu.type}`}
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
