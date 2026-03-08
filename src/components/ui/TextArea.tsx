import css from "./TextInput.css?inline";

interface TextAreaProps {
    value: string;
    onInput: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    rows?: number;
    required?: boolean;
    size?: "sm" | "md" | "lg";
    color?: "surface" | "page" | "transparent";
    id?: string;
    ref?: (el: HTMLTextAreaElement) => void;
    class?: string;
}

export default function TextArea(props: TextAreaProps) {
    const size = () => props.size ?? "sm";
    const color = () => props.color ?? "surface";

    return (
        <>
            <style>{css}</style>
            <textarea
                class={`input textarea input-${size()} input-${color()}${props.class ? ` ${props.class}` : ""}`}
                value={props.value}
                onInput={(e) => props.onInput(e.currentTarget.value)}
                onBlur={props.onBlur}
                placeholder={props.placeholder}
                rows={props.rows}
                required={props.required}
                id={props.id}
                ref={props.ref}
            />
        </>
    );
}
