import type { JSX } from "solid-js";
import css from "./FormLabel.css?inline";

interface FormLabelProps {
  children: JSX.Element;
}

export default function FormLabel(props: FormLabelProps) {
  return (
    <>
      <style>{css}</style>
      <label class="form-label">{props.children}</label>
    </>
  );
}
