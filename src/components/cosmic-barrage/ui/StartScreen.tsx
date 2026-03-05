import css from "./StartScreen.css?inline";

export default function StartScreen() {
    return (
        <>
            <style>{css}</style>
            <div class="cb-start">
                <div class="cb-start-title">COSMIC BARRAGE</div>
                <div class="cb-start-subtitle">PRESS SPACE TO START</div>
                <div class="cb-start-controls">
                    <kbd>A</kbd> / <kbd>D</kbd> or <kbd>&larr;</kbd> /{" "}
                    <kbd>&rarr;</kbd> to move
                    <br />
                    <kbd>SPACE</kbd> to shoot
                </div>
            </div>
        </>
    );
}
