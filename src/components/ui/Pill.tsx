import type { JSX } from "solid-js";
import shapeCss from "~/styles/control-shapes.css?inline";
import css from "./Pill.css?inline";

interface PillProps {
  color?: "primary" | "danger" | "success" | "neutral";
  title?: string;
  children: JSX.Element;
}

export default function Pill(props: PillProps) {
  const cls = () => `shape-pill pill-${props.color ?? "primary"}`;

  return (
    <>
      <style>{shapeCss + css}</style>
      <span class={cls()} title={props.title}>
        {props.children}
      </span>
    </>
  );
}
