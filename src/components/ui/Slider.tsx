import css from "./Slider.css?inline";

interface SliderProps {
    value: number;
    onInput: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export default function Slider(props: SliderProps) {
    const min = () => props.min ?? 0;
    const max = () => props.max ?? 100;
    const step = () => props.step ?? 1;

    const pct = () => ((props.value - min()) / (max() - min())) * 100;

    function clamp(n: number) {
        return Math.min(max(), Math.max(min(), n));
    }

    function handleRange(e: InputEvent & { currentTarget: HTMLInputElement }) {
        props.onInput(Number(e.currentTarget.value));
    }

    function handleNumber(e: InputEvent & { currentTarget: HTMLInputElement }) {
        const parsed = parseInt(e.currentTarget.value);
        if (!Number.isNaN(parsed)) props.onInput(parsed);
    }

    function handleBlur(e: FocusEvent & { currentTarget: HTMLInputElement }) {
        const parsed = parseInt(e.currentTarget.value);
        props.onInput(Number.isNaN(parsed) ? min() : clamp(parsed));
    }

    return (
        <>
            <style>{css}</style>
            <div class="slider">
                <input
                    class="slider-range"
                    type="range"
                    value={props.value}
                    onInput={handleRange}
                    min={min()}
                    max={max()}
                    step={step()}
                    style={{
                        background: `linear-gradient(to right, var(--color-primary) ${pct()}%, var(--color-neutral) ${pct()}%)`,
                    }}
                />
                <input
                    class="slider-number"
                    type="number"
                    value={props.value}
                    onInput={handleNumber}
                    onBlur={handleBlur}
                    min={min()}
                    max={max()}
                    step={step()}
                />
            </div>
        </>
    );
}
