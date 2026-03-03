import css from "./Spinner.css?inline";

interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    center?: boolean;
}

export default function Spinner(props: SpinnerProps) {
    const cls = () => {
        let c = `spinner-container ${props.size ? `spinner-${props.size}` : "spinner-lg"}`;
        if (props.center) c += " spinner-center";
        return c;
    };

    return (
        <>
            <style>{css}</style>
            <div class={cls()}>
                <div class="spinner" />
            </div>
        </>
    );
}
