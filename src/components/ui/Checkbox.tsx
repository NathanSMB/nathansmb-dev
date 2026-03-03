import css from "./Checkbox.css?inline";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function Checkbox(props: CheckboxProps) {
  return (
    <>
      <style>{css}</style>
      <input
        type="checkbox"
        class="checkbox"
        checked={props.checked}
        onChange={props.onChange}
        disabled={props.disabled}
      />
    </>
  );
}
