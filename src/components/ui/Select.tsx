import { For, createSignal, onCleanup } from "solid-js";
import css from "./Select.css?inline";

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
    const [open, setOpen] = createSignal(false);
    let wrapperRef!: HTMLDivElement;

    const selectedLabel = () =>
        props.options.find((o) => o.value === props.value)?.label ??
        props.value;

    function handleClickOutside(e: MouseEvent) {
        if (open() && !wrapperRef.contains(e.target as Node)) {
            setOpen(false);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);
    onCleanup(() =>
        document.removeEventListener("mousedown", handleClickOutside),
    );

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
    }

    return (
        <>
            <style>{css}</style>
            <div
                ref={wrapperRef}
                class={`select-wrapper${props.class ? ` ${props.class}` : ""}`}
                onKeyDown={handleKeyDown}
            >
                <button
                    type="button"
                    class={`select-trigger${open() ? " open" : ""}`}
                    disabled={props.disabled}
                    onClick={() => setOpen(!open())}
                >
                    <span>{selectedLabel()}</span>
                    <span class="select-chevron" aria-hidden="true">
                        &#x25BE;
                    </span>
                </button>
                {open() && (
                    <ul class="select-dropdown" role="listbox">
                        <For each={props.options}>
                            {(opt) => (
                                <li
                                    role="option"
                                    aria-selected={opt.value === props.value}
                                    class={`select-option${opt.value === props.value ? " selected" : ""}`}
                                    onMouseDown={() => {
                                        props.onChange(opt.value);
                                        setOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </li>
                            )}
                        </For>
                    </ul>
                )}
            </div>
        </>
    );
}
