import type { JSX } from "solid-js";
import css from "./Form.css?inline";

interface FormProps {
  onSubmit: (e: Event) => void;
  children: JSX.Element;
}

export default function Form(props: FormProps) {
  return (
    <>
      <style>{css}</style>
      <form class="form" onSubmit={props.onSubmit}>{props.children}</form>
    </>
  );
}
