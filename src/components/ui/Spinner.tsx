import css from "./Spinner.css?inline";

interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export default function Spinner(props: SpinnerProps) {
    const cls = () =>
        `spinner-container ${props.size ? `spinner-${props.size}` : "spinner-lg"}`;

    return (
        <>
            <style>{css}</style>
            <div class={cls()}>
                <div class="spinner" />
            </div>
        </>
    );
}
