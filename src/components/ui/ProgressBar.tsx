import css from "./ProgressBar.css?inline";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: "primary" | "error" | "success";
}

export default function ProgressBar(props: ProgressBarProps) {
  const pct = () => (props.total > 0 ? (props.current / props.total) * 100 : 0);
  const label = () => props.label ?? "completed";
  const cls = () => `progress-bar progress-bar-${props.color ?? "primary"}`;

  return (
    <>
      <style>{css}</style>
      <div class={cls()}>
        <span class="progress-bar-label">
          {props.current} of {props.total} {label()}
        </span>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style={{ width: `${pct()}%` }} />
        </div>
      </div>
    </>
  );
}
