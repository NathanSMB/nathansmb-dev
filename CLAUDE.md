## Package Manager and Runtime

Use bun as the package manager and runtime.

#### Documentations:

[Bun](https://bun.com/docs)

## Frontend Framework

The frontend framework is Solid and was initialized with SolidStart.

#### Documentation:

- [Solid](https://docs.solidjs.com/)
- [SolidStart](https://docs.solidjs.com/solid-start/)

## Auth

Auth is done with the better-auth library and uses the email and password auth. The auth config and be found at @src/utils/auth.ts

For any interaction with the users, accounts, and sessions make sure to use the better-auth library when possible.

#### Documentation:

- [Better Auth](https://www.better-auth.com/docs)

## Styling

### Global

For global styles that should apply to every page include them in the @src/app.css.

### Reusable Layouts

Reusable layout styles shared across multiple pages live in `src/styles/` (e.g. `page-narrow.css`). Import them directly in any page that needs them.

### Page

For styles specific to a single page, put them in their own stylesheet alongside the route file. A page can combine a reusable layout with page-specific styles.

#### Example

```tsx
import "~/styles/page-narrow.css";
import "./profile.css";

export default function ProfilePage() {
  return <main class="page-narrow">...</main>;
}
```

### Components

For components use the `?inline` parameter for css imports.

#### Example Component:

```tsx
import { Show } from "solid-js";
import css from "./Example.css?inline";

interface ExampleProps {
  option?: "first-option" | "second-option";
}

export default function Example(props: ExampleProps) {
  const cls = () => `some-cls ${props.size === "firstoption" ? "some-other-cls" : "and-another-cls"}`;

  return (
    <>
      <style>{css}</style>
      <span class={cls()}>Example</span>
    </>
  );
}
```
