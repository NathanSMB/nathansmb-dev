import css from "./TextInput.css?inline";

interface TextInputProps {
  value: string;
  onInput: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  placeholder?: string;
  type?: "text" | "email" | "url";
  variant?: "toolbar" | "inline";
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
        ref={props.ref}
      />
    </>
  );
}
