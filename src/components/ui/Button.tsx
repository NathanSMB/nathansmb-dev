import type { JSX } from "solid-js";
import css from "./Button.css?inline";

interface ButtonProps {
  variant: "primary" | "danger" | "success" | "danger-solid" | "ghost" | "pagination";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  children: JSX.Element;
  class?: string;
}

export default function Button(props: ButtonProps) {
  return (
    <>
      <style>{css}</style>
      <button
        class={`btn btn-${props.variant}${props.class ? ` ${props.class}` : ""}`}
        onClick={props.onClick}
        disabled={props.disabled}
        type={props.type ?? "button"}
      >
        {props.children}
      </button>
    </>
  );
}
