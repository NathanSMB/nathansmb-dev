import type { JSX } from "solid-js";
import shapeCss from "~/styles/control-shapes.css?inline";
import css from "./Button.css?inline";

const variantClass = {
    default: "shape-default",
    pill: "shape-pill",
} as const;

const sizeClass = {
    sm: "shape-sm",
    md: "shape-md",
    lg: "shape-lg",
} as const;

interface ButtonProps {
    color?: "primary" | "danger" | "success" | "neutral";
    variant?: "default" | "pill";
    size?: "sm" | "md" | "lg";
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    children: JSX.Element;
    class?: string;
}

export default function Button(props: ButtonProps) {
    const cls = () => {
        const variant = props.variant ?? "default";
        let c = `btn btn-${props.color ?? "primary"} ${variantClass[variant]}`;
        if (variant !== "pill") c += ` ${sizeClass[props.size ?? "md"]}`;
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
