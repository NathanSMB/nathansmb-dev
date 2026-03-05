import css from "./StartScreen.css?inline";

export default function StartScreen() {
    return (
        <>
            <style>{css}</style>
            <div class="cb-start">
                <div class="cb-start-title">COSMIC BARRAGE</div>
                <div class="cb-start-subtitle">PRESS SPACE OR TAP TO START</div>
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
