import type { JSX } from "solid-js";
import shapeCss from "~/styles/control-shapes.css?inline";
import css from "./Button.css?inline";

const variantClass = {
    btn: "shape-btn",
    pill: "shape-pill",
    form: "shape-form",
} as const;

interface ButtonProps {
    color?: "primary" | "danger" | "success" | "neutral";
    variant?: "pill" | "form";
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    children: JSX.Element;
    class?: string;
}

export default function Button(props: ButtonProps) {
    const cls = () => {
        let c = `btn btn-${props.color ?? "primary"} ${variantClass[props.variant ?? "btn"]}`;
        if (props.class) c += ` ${props.class}`;
        return c;
    };

    return (
        <>
            <style>{shapeCss + css}</style>
            <button
                class={cls()}
                onClick={props.onClick}
                disabled={props.disabled}
                type={props.type ?? "button"}
            >
                {props.children}
            </button>
        </>
    );
}
