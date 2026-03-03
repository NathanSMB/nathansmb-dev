import type { JSX } from "solid-js";
import css from "./Form.css?inline";

interface FormProps {
    variant?: "default" | "inline";
    class?: string;
    onSubmit: (e: Event) => void;
    children: JSX.Element;
}

export default function Form(props: FormProps) {
    const cls = () =>
        `form form-${props.variant ?? "default"}${props.class ? ` ${props.class}` : ""}`;

    return (
        <>
            <style>{css}</style>
            <form
                class={cls()}
                onSubmit={(e) => {
                    e.preventDefault();
                    props.onSubmit(e);
                }}
            >
                {props.children}
            </form>
        </>
    );
}
