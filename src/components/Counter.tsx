import { createSignal } from "solid-js";
import css from "./Counter.css?inline";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <>
      <style>{css}</style>
      <button class="increment" onClick={() => setCount(count() + 1)} type="button">
        Clicks: {count()}
      </button>
    </>
  );
}
