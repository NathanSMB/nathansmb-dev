import { Show } from "solid-js";
import css from "./MuscleTooltip.css?inline";

interface MuscleTooltipProps {
    name: string | null;
    x: number;
    y: number;
}

export default function MuscleTooltip(props: MuscleTooltipProps) {
    return (
        <>
            <style>{css}</style>
            <div
                class={`muscle-tooltip${props.name ? " visible" : ""}`}
                style={{ left: `${props.x}px`, top: `${props.y}px` }}
            >
                <Show when={props.name}>{(name) => name()}</Show>
            </div>
        </>
    );
}
