import { For } from "solid-js";
import "./Select.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  class?: string;
}

export default function Select(props: SelectProps) {
  return (
    <select
      class={`select${props.class ? ` ${props.class}` : ""}`}
      value={props.value}
      onChange={(e) => props.onChange(e.currentTarget.value)}
      disabled={props.disabled}
    >
      <For each={props.options}>
        {(opt) => <option value={opt.value}>{opt.label}</option>}
      </For>
    </select>
  );
}
