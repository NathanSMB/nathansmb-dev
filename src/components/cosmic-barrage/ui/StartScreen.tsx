import { Show } from "solid-js";
import css from "./StartScreen.css?inline";

interface StartScreenProps {
    loading?: boolean;
}

export default function StartScreen(props: StartScreenProps) {
    return (
        <>
            <style>{css}</style>
            <div class="cb-start">
                <div class="cb-start-title">COSMIC BARRAGE</div>
                <Show
                    when={!props.loading}
                    fallback={<div class="cb-start-subtitle">LOADING...</div>}
                >
                    <div class="cb-start-subtitle">
                        PRESS SPACE OR TAP TO START
                    </div>
                </Show>
                <div class="cb-start-controls">
                    <kbd>A</kbd> / <kbd>D</kbd> or <kbd>&larr;</kbd> /{" "}
                    <kbd>&rarr;</kbd> to move &mdash; <kbd>SPACE</kbd> to shoot
                    <br />
                    Mouse hover to move &mdash; Click to shoot
                    <br />
                    Touch to move &mdash; Second finger to shoot
                </div>
            </div>
        </>
    );
}
