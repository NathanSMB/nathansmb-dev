# UI Components

All reusable UI components live in `src/components/ui/`. They follow the `?inline` CSS import pattern described in the project's [component conventions](../CLAUDE.md).

## Component Reference

### Avatar

Displays a user image or a name-initial placeholder.

```tsx
interface AvatarProps {
    image?: string | null;
    name: string;
    size?: "default" | "lg";
}
```

```tsx
<Avatar name="Nathan" image={user.image} size="lg" />
```

### Banner

Conditional message banner with color variants.

```tsx
interface BannerProps {
    variant: "error" | "success" | "info";
    message: string | false | null | undefined;
}
```

```tsx
<Banner variant="error" message={error()} />
```

Only renders when `message` is truthy.

### Button

```tsx
interface ButtonProps {
    color?: "primary" | "danger" | "success" | "neutral";
    variant?: "pill" | "form";
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    children: JSX.Element;
    class?: string;
}
```

```tsx
<Button color="primary" variant="form" type="submit">Save</Button>
<Button color="danger" variant="pill" onClick={handleDelete}>Remove</Button>
```

Default shape is `btn` (standard button). `pill` gives a compact pill shape, `form` gives a full-width form button. Uses shared styles from `control-shapes.css`.

### Checkbox

```tsx
interface CheckboxProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}
```

```tsx
<Checkbox checked={selected()} onChange={() => setSelected(!selected())} />
```

### Form

Form wrapper that prevents default submit behavior.

```tsx
interface FormProps {
    variant?: "default" | "inline";
    class?: string;
    onSubmit: (e: Event) => void;
    children: JSX.Element;
}
```

```tsx
<Form variant="inline" onSubmit={handleSearch}>
    <TextInput value={query()} onInput={setQuery} />
    <Button type="submit">Search</Button>
</Form>
```

`default` lays out children in a column, `inline` in a row.

### FormLabel

```tsx
interface FormLabelProps {
    for?: string;
    children: JSX.Element;
}
```

```tsx
<FormLabel for="email">Email address</FormLabel>
```

### Pill

Small status/tag indicator. Uses shared styles from `control-shapes.css`.

```tsx
interface PillProps {
    color?: "primary" | "danger" | "success" | "neutral";
    title?: string;
    children: JSX.Element;
}
```

```tsx
<Pill color="success">Active</Pill>
<Pill color="danger" title="User is banned">Banned</Pill>
```

### ProgressBar

```tsx
interface ProgressBarProps {
    current: number;
    total: number;
    label?: string;
    color?: "primary" | "error" | "success";
}
```

```tsx
<ProgressBar current={completed()} total={total} label="Processing users" />
```

### Select

Custom dropdown with keyboard navigation and click-outside-to-close.

```tsx
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
```

```tsx
<Select
    value={role()}
    options={[
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
    ]}
    onChange={setRole}
/>
```

### Slider

Range slider with a companion number input.

```tsx
interface SliderProps {
    value: number;
    onInput: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}
```

```tsx
<Slider value={volume()} onInput={setVolume} min={0} max={100} step={5} />
```

### Spinner

Animated loading indicator.

```tsx
interface SpinnerProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    center?: boolean;
}
```

```tsx
<Spinner size="sm" />
<Spinner size="lg" center />
```

`center` wraps the spinner in a centering container.

### TextInput

```tsx
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
```

```tsx
<TextInput
    value={email()}
    onInput={setEmail}
    type="email"
    variant="form"
    placeholder="you@example.com"
/>
```

## Shared Styles

`src/styles/control-shapes.css` provides shared shape classes used by **Button** and **Pill**:

- `.shape-btn` — Standard button sizing and padding
- `.shape-pill` — Compact inline pill with small text
- `.shape-form` — Full-width form control sizing

## Key Files

| File                                | Purpose                              |
| ----------------------------------- | ------------------------------------ |
| `src/components/ui/Avatar.tsx`      | User avatar with image/initial       |
| `src/components/ui/Banner.tsx`      | Conditional message banner           |
| `src/components/ui/Button.tsx`      | Button with color/shape variants     |
| `src/components/ui/Checkbox.tsx`    | Custom styled checkbox               |
| `src/components/ui/Form.tsx`        | Form wrapper with layout variants    |
| `src/components/ui/FormLabel.tsx`   | Label for form inputs                |
| `src/components/ui/Pill.tsx`        | Status/tag pill indicator            |
| `src/components/ui/ProgressBar.tsx` | Animated progress bar                |
| `src/components/ui/Select.tsx`      | Custom dropdown select               |
| `src/components/ui/Slider.tsx`      | Range slider with number input       |
| `src/components/ui/Spinner.tsx`     | Loading spinner with size variants   |
| `src/components/ui/TextInput.tsx`   | Text input with variants             |
| `src/styles/control-shapes.css`     | Shared shape classes for Button/Pill |
