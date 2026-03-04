import css from "./StartScreen.css?inline";

export default function StartScreen() {
    return (
        <>
            <style>{css}</style>
            <div class="si-start">
                <div class="si-start-title">SPACE INVADERS</div>
                <div class="si-start-subtitle">PRESS SPACE TO START</div>
                <div class="si-start-controls">
                    <kbd>A</kbd> / <kbd>D</kbd> or <kbd>&larr;</kbd> /{" "}
                    <kbd>&rarr;</kbd> to move
                    <br />
                    <kbd>SPACE</kbd> to shoot
                </div>
            </div>
        </>
    );
}
