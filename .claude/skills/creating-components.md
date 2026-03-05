# Creating UI Components

UI components live in `src/components/ui/` with a `.tsx` file and a matching `.css` file.

## Component Structure

1. **CSS import** — use the `?inline` suffix so styles are injected via `<style>` tag
2. **Props interface** — typed props with optional variants/colors and sensible defaults
3. **Class builder** — a reactive function that assembles class names from props
4. **Return pattern** — `<><style>{css}</style><element>...</element></>`

### Minimal example

```tsx
import css from "./Badge.css?inline";

interface BadgeProps {
    color?: "primary" | "danger" | "success";
    children: JSX.Element;
    class?: string;
}

export default function Badge(props: BadgeProps) {
    const cls = () => {
        let c = `badge badge-${props.color ?? "primary"}`;
        if (props.class) c += ` ${props.class}`;
        return c;
    };

    return (
        <>
            <style>{css}</style>
            <span class={cls()}>{props.children}</span>
        </>
    );
}
```

## Shared Shape Styles

Components that act as form controls (buttons, inputs, selects) import the shared shape CSS for consistent sizing:

```tsx
import shapeCss from "~/styles/control-shapes.css?inline";
import css from "./Button.css?inline";

// In the return:
<style>{shapeCss + css}</style>;
```

Shape classes: `shape-btn`, `shape-pill`, `shape-form`.

## Reference: Button.tsx

```tsx
import type { JSX } from "solid-js";
import shapeCss from "~/styles/control-shapes.css?inline";
import css from "./Button.css?inline";

const variantClass = {
    btn: "shape-btn",
    pill: "shape-pill",
    form: "shape-form",
} as const;

interface ButtonProps {
    color?: "primary" | "danger" | "success" | "neutral";
    variant?: "pill" | "form";
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    children: JSX.Element;
    class?: string;
}

export default function Button(props: ButtonProps) {
    const cls = () => {
        let c = `btn btn-${props.color ?? "primary"} ${variantClass[props.variant ?? "btn"]}`;
        if (props.class) c += ` ${props.class}`;
        return c;
    };

    return (
        <>
            <style>{shapeCss + css}</style>
            <button
                class={cls()}
                onClick={props.onClick}
                disabled={props.disabled}
                type={props.type ?? "button"}
            >
                {props.children}
            </button>
        </>
    );
}
```

## Reference: TextInput.tsx

```tsx
import css from "./TextInput.css?inline";

interface TextInputProps {
    value: string;
    onInput: (value: string) => void;
    onBlur?: () => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    placeholder?: string;
    type?: "text" | "email" | "url" | "number" | "password";
    min?: number;
    max?: number;
    required?: boolean;
    variant?: "toolbar" | "inline" | "form";
    id?: string;
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
                min={props.min}
                max={props.max}
                required={props.required}
                id={props.id}
                ref={props.ref}
            />
        </>
    );
}
```

## Conventions

- Default prop values via `??` in the class builder, not in the interface
- Accept an optional `class?: string` prop and append it in the class builder
- Use `JSX.Element` for children, import from `solid-js`
- CSS file name matches component name (e.g. `Button.css` for `Button.tsx`)
- No external CSS framework — all styling is custom with design tokens from `src/app.css`
