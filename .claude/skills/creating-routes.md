# Creating Routes

This project uses SolidStart file-based routing. Routes live in `src/routes/`.

## Page Routes

Create a `.tsx` file in `src/routes/` — the file path becomes the URL.

| File                                  | URL                     |
| ------------------------------------- | ----------------------- |
| `src/routes/about.tsx`                | `/about`                |
| `src/routes/games/cosmic-barrage.tsx` | `/games/cosmic-barrage` |
| `src/routes/admin/index.tsx`          | `/admin`                |

### Basic page (no auth)

```tsx
import { Title } from "@solidjs/meta";

export default function MyPage() {
    return (
        <main>
            <Title>My Page</Title>
            <h1>Hello</h1>
        </main>
    );
}
```

### Page with auth (login required)

Use `requireAuth()` to protect a page. It redirects unauthenticated users to `/login` and banned users to `/forbidden`.

```tsx
import { Show } from "solid-js";
import { requireAuth } from "~/auth/require-auth";
import Spinner from "~/components/ui/Spinner";

export default function ProtectedPage() {
    const { authorized, session } = requireAuth();

    return (
        <Show when={authorized()} fallback={<Spinner size="xl" center />}>
            <main>
                <h1>Welcome {session().data?.user.name}</h1>
            </main>
        </Show>
    );
}
```

### Page with permission-based auth

Pass a `permissions` object to require specific roles. Users without the required permissions are redirected to `/forbidden`.

```tsx
const { authorized } = requireAuth({
    permissions: {
        user: ["list", "ban", "delete"],
    },
});
```

The permissions object is `Record<string, string[]>` where keys are resources and values are required actions.

## Layouts

A layout wraps all routes inside a matching directory. The layout file has the **same name** as the directory it wraps.

| Layout file               | Wraps routes in         |
| ------------------------- | ----------------------- |
| `src/routes/admin.tsx`    | `src/routes/admin/*`    |
| `src/routes/settings.tsx` | `src/routes/settings/*` |

### Creating a layout

1. Create a directory for the routes: `src/routes/dashboard/`
2. Create a layout file with the same name: `src/routes/dashboard.tsx`
3. The layout receives `props.children` which are the matched child routes.

```tsx
import { Show, type JSX } from "solid-js";
import { requireAuth } from "~/auth/require-auth";
import Spinner from "~/components/ui/Spinner";

export default function DashboardLayout(props: { children: JSX.Element }) {
    const { authorized } = requireAuth();

    return (
        <Show when={authorized()} fallback={<Spinner size="xl" center />}>
            {props.children}
        </Show>
    );
}
```

All pages inside `src/routes/dashboard/` are now auth-protected by the layout — they don't need their own `requireAuth()` calls.

### Route groups (layout without URL segment)

Wrap the directory name in parentheses to create a layout that doesn't add a URL segment. Example: `src/routes/(auth).tsx` wraps `src/routes/(auth)/login.tsx` and `src/routes/(auth)/register.tsx`, but URLs are `/login` and `/register` (not `/(auth)/login`).

### Exporting nav links from a layout

Layouts can export a `navLinks` array for navigation components:

```tsx
import type { NavLink } from "~/components/nav/nav-links";

export const navLinks: NavLink[] = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/settings", label: "Settings" },
];
```

## Page Styles

- **Reusable layout styles**: Import from `~/styles/` (e.g. `import "~/styles/page-narrow.css"`)
- **Page-specific styles**: Place a `.css` file alongside the route file and import it relatively (e.g. `import "./my-page.css"`)

These can be combined:

```tsx
import "~/styles/page-narrow.css";
import "./my-page.css";

export default function MyPage() {
    return <main class="page-narrow">...</main>;
}
```

## API / HTTP Routes

API routes live in `src/routes/api/` and export named functions for HTTP methods. The file path determines the endpoint URL.

| File                                | Endpoint                    |
| ----------------------------------- | --------------------------- |
| `src/routes/api/admin/batch/ban.ts` | `POST /api/admin/batch/ban` |
| `src/routes/api/auth/*all.ts`       | `/api/auth/*` (catch-all)   |

### Basic API route

Export named functions matching HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`). Each receives an `APIEvent`.

```ts
import type { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
    return new Response(JSON.stringify({ hello: "world" }), {
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(event: APIEvent) {
    const body = await event.request.json();
    // ... handle request
    return new Response("OK", { status: 200 });
}
```

### API route with auth

Use `auth.api.getSession()` server-side to verify the user's session from request headers.

```ts
import type { APIEvent } from "@solidjs/start/server";
import { auth } from "~/auth/core";

export async function POST(event: APIEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    // session.user is available here
    const body = await event.request.json();
    // ... handle request
    return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
    });
}
```

### API route with admin-only auth

Check `session.user.role` for role-based access:

```ts
const session = await auth.api.getSession({
    headers: event.request.headers,
});
if (!session || session.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
}
```

### Catch-all API routes

Use `*all.ts` as the filename to handle all sub-paths. Used for the better-auth handler:

```ts
// src/routes/api/auth/*all.ts
import { auth } from "~/auth/core";
import { toSolidStartHandler } from "better-auth/solid-start";

export const { GET, POST } = toSolidStartHandler(auth);
```

### Streaming responses

For long-running operations, use `createBatchStream` and `batchStreamResponse` from `~/utils/stream-batch`:

```ts
import { createBatchStream, batchStreamResponse } from "~/utils/stream-batch";

const stream = createBatchStream(items, (item) => processItem(item));
return batchStreamResponse(stream);
```

## Special Route Files

| File pattern   | Purpose                                                         |
| -------------- | --------------------------------------------------------------- |
| `[...404].tsx` | Catch-all 404 page                                              |
| `*all.ts`      | API catch-all for all sub-paths                                 |
| `index.tsx`    | Index route for a directory (e.g. `admin/index.tsx` → `/admin`) |
