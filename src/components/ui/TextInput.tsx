import css from "./TextInput.css?inline";

interface TextInputProps {
    value: string;
    onInput: (value: string) => void;
    onBlur?: () => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    placeholder?: string;
    type?: "text" | "email" | "url" | "number" | "password";
    min?: number;
    max?: number;
    required?: boolean;
    variant?: "toolbar" | "inline" | "form";
    id?: string;
    ref?: (el: HTMLInputElement) => void;
    class?: string;
}

export default function TextInput(props: TextInputProps) {
    const variant = () => props.variant ?? "inline";

    return (
        <>
            <style>{css}</style>
            <input
                class={`input input-${variant()}${props.class ? ` ${props.class}` : ""}`}
                type={props.type ?? "text"}
                value={props.value}
                onInput={(e) => props.onInput(e.currentTarget.value)}
                onBlur={props.onBlur}
                onKeyDown={props.onKeyDown}
                placeholder={props.placeholder}
                min={props.min}
                max={props.max}
                required={props.required}
                id={props.id}
                ref={props.ref}
            />
        </>
    );
}
