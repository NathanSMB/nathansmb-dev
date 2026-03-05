# Design Tokens

All CSS custom properties are defined in `src/app.css` on `:root`. Dark mode overrides automatically via `@media (prefers-color-scheme: dark)`.

## Semantic Colors (OKLCH)

| Token                    | Light                 | Dark                  |
| ------------------------ | --------------------- | --------------------- |
| `--color-primary`        | `oklch(90% 0.07 290)` | `oklch(30% 0.12 290)` |
| `--color-primary-hover`  | `oklch(95% 0.07 290)` | `oklch(20% 0.12 290)` |
| `--color-primary-ink`    | `oklch(35% 0.12 290)` | `oklch(90% 0.1 290)`  |
| `--color-primary-accent` | `oklch(75% 0.18 290)` | `oklch(50% 0.18 290)` |
| `--color-error`          | `oklch(90% 0.12 29)`  | `oklch(30% 0.16 29)`  |
| `--color-error-hover`    | `oklch(95% 0.12 29)`  | `oklch(20% 0.16 29)`  |
| `--color-error-ink`      | `oklch(35% 0.14 29)`  | `oklch(90% 0.12 29)`  |
| `--color-error-accent`   | `oklch(75% 0.2 29)`   | `oklch(50% 0.2 29)`   |
| `--color-success`        | `oklch(90% 0.1 152)`  | `oklch(30% 0.14 152)` |
| `--color-success-hover`  | `oklch(95% 0.1 152)`  | `oklch(20% 0.14 152)` |
| `--color-success-ink`    | `oklch(35% 0.12 152)` | `oklch(90% 0.1 152)`  |
| `--color-success-accent` | `oklch(75% 0.18 152)` | `oklch(50% 0.18 152)` |

Each color has four variants: base (background), `-hover`, `-ink` (text), `-accent` (decorative).

## Text Colors

| Token                 | Light                  | Dark                   |
| --------------------- | ---------------------- | ---------------------- |
| `--color-text`        | `oklch(23% 0.012 300)` | `oklch(92% 0.012 300)` |
| `--color-text-muted`  | `oklch(36% 0.012 300)` | `oklch(81% 0.012 300)` |
| `--color-text-subtle` | `oklch(48% 0.012 300)` | `oklch(70% 0.012 300)` |
| `--color-text-faint`  | `oklch(59% 0.012 300)` | `oklch(59% 0.012 300)` |

## Links

| Token          | Light                 | Dark                  |
| -------------- | --------------------- | --------------------- |
| `--color-link` | `oklch(45% 0.14 290)` | `oklch(72% 0.12 290)` |

## Surfaces

| Token             | Light                    | Dark                   |
| ----------------- | ------------------------ | ---------------------- |
| `--color-surface` | `oklch(95.5% 0.018 300)` | `oklch(23% 0.025 285)` |
| `--color-page-bg` | `oklch(98% 0.008 300)`   | `oklch(16% 0.025 285)` |

## Contrast / Overlay

| Token                     | Value                                                    |
| ------------------------- | -------------------------------------------------------- |
| `--color-text-on-colored` | `oklch(0% 0 none)` (light) / `oklch(100% 0 none)` (dark) |
| `--color-neutral`         | `oklch(90% 0.02 300)` / `oklch(32% 0.02 285)`            |
| `--color-neutral-hover`   | `oklch(94% 0.02 300)` / `oklch(28% 0.02 285)`            |
| `--color-overlay`         | `oklch(0% 0 none / 0.5)`                                 |
| `--color-shadow`          | `oklch(0% 0 none / 0.2)`                                 |

## Panel System

| Token                  | Value                                           |
| ---------------------- | ----------------------------------------------- |
| `--panel-bg`           | `oklch(from var(--color-surface) l c h / 0.35)` |
| `--panel-border`       | `oklch(from var(--color-primary) l c h / 0.08)` |
| `--panel-shadow`       | inset highlight + inset bottom shadow           |
| `--panel-hover-bg`     | `oklch(from var(--color-primary) l c h / 0.1)`  |
| `--panel-hover-border` | `oklch(from var(--color-primary) l c h / 0.15)` |
| `--panel-hover-shadow` | inset highlight + outer shadow                  |

## Dropdown / Popup

| Token               | Value                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| `--dropdown-border` | `oklch(from var(--color-primary) l c h / 0.1)`                            |
| `--dropdown-shadow` | `0 6px 20px oklch(0% 0 none / 0.12), 0 1.5px 6px oklch(0% 0 none / 0.06)` |

## Typography

| Token         | Value     |
| ------------- | --------- |
| `--text-xs`   | `0.8rem`  |
| `--text-sm`   | `0.85rem` |
| `--text-base` | `0.9rem`  |
| `--text-md`   | `1rem`    |
| `--text-lg`   | `1.3rem`  |
| `--text-xl`   | `1.8rem`  |
| `--text-2xl`  | `2rem`    |
| `--text-icon` | `3rem`    |

## Spacing

### Padding (`--pad-*`)

| Token                 | Value         |
| --------------------- | ------------- |
| `--pad-inline-edit`   | `0.2em 0.4em` |
| `--pad-pill`          | `0.2em 0.6em` |
| `--pad-input-compact` | `0.3em 0.6em` |
| `--pad-control`       | `0.5em 0.8em` |
| `--pad-input`         | `0.6em 0.8em` |
| `--pad-btn-wide`      | `0.6em 1.5em` |
| `--pad-field`         | `0.7em`       |
| `--pad-cell`          | `0.7em 0.8em` |
| `--pad-bar`           | `0.5rem`      |
| `--pad-main`          | `1em`         |
| `--pad-header`        | `1rem`        |
| `--pad-page`          | `1.5rem 2rem` |
| `--pad-page-narrow`   | `2rem`        |
| `--pad-modal`         | `2rem 2.5rem` |

### Gap (`--gap-*`)

| Token          | Value     |
| -------------- | --------- |
| `--gap-label`  | `0.3rem`  |
| `--gap-tight`  | `0.4rem`  |
| `--gap-inline` | `0.5rem`  |
| `--gap-group`  | `0.75rem` |
| `--gap-stack`  | `1rem`    |

### Margins (`--space-*`)

| Token         | Value     |
| ------------- | --------- |
| `--space-sm`  | `0.5rem`  |
| `--space-md`  | `0.75rem` |
| `--space-lg`  | `1rem`    |
| `--space-xl`  | `1.5rem`  |
| `--space-2xl` | `2rem`    |

## Borders

### Width

| Token              | Value   |
| ------------------ | ------- |
| `--border-thin`    | `1px`   |
| `--border-control` | `1.5px` |
| `--border-medium`  | `2px`   |
| `--border-thick`   | `4px`   |

### Radius

| Token              | Value     |
| ------------------ | --------- |
| `--radius-track`   | `0.25rem` |
| `--radius-sm`      | `0.3em`   |
| `--radius-md`      | `0.4em`   |
| `--radius-control` | `0.5em`   |
| `--radius-lg`      | `0.75em`  |
| `--radius-pill`    | `1em`     |
| `--radius-circle`  | `50%`     |

## Layout Widths

| Token            | Value   |
| ---------------- | ------- |
| `--width-narrow` | `24rem` |
| `--width-modal`  | `28rem` |
| `--width-medium` | `32rem` |
| `--width-wide`   | `64rem` |

## Transitions

| Token               | Value   |
| ------------------- | ------- |
| `--duration-fast`   | `0.15s` |
| `--duration-normal` | `0.2s`  |
| `--duration-spin`   | `0.8s`  |

## Other

| Token                    | Value  |
| ------------------------ | ------ |
| `--opacity-disabled`     | `0.5`  |
| `--opacity-avatar-hover` | `0.35` |
| `--z-modal`              | `1000` |

## Dark Mode

Dark mode activates automatically via `@media (prefers-color-scheme: dark)`. It overrides semantic colors, text colors, link color, surfaces, and neutrals on `:root`. No manual toggling — the system preference controls it.
