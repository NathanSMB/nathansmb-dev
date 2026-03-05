# Auth & Access Control

The app uses **better-auth** with the **admin plugin** for authentication and role-based access control.

## Auth Configuration

**Server** (`src/auth/core.ts`): Configures `betterAuth` with email/password auth, the `admin()` plugin, and a Drizzle adapter over PostgreSQL.

**Client** (`src/auth/auth-client.ts`): Creates the auth client with `adminClient()` for client-side session and permission checks.

**Database** (`src/database/schemas/auth.ts`): The `user` table has a `role` column (text), plus `banned`, `banReason`, and `banExpires` fields. The `session` table has `impersonatedBy` for admin impersonation.

## Roles

| Role    | Description                         |
| ------- | ----------------------------------- |
| `user`  | Default role, no admin capabilities |
| `admin` | Full control over user management   |

## Route Guard: `requireAuth()`

`src/auth/require-auth.ts` exports a `requireAuth()` hook for protecting client-side routes.

Behavior:

1. If the user is not logged in, redirects to `/login?redirect=<current path>`
2. If the user is banned, redirects to `/forbidden`
3. If `permissions` are specified, checks them via `authClient.admin.hasPermission()` — redirects to `/forbidden` on failure
4. Returns `{ session, authorized }` — `authorized` is a signal that becomes `true` once all checks pass

```tsx
import { requireAuth } from "~/auth/require-auth";

export default function AdminPage() {
    const { session, authorized } = requireAuth({
        permissions: { user: ["list", "ban"] },
    });
    // ...
}
```

## Server-Side API Protection

API routes under `src/routes/api/admin/` use a manual session + role check pattern:

```ts
const session = await auth.api.getSession({ headers: getWebRequest().headers });
if (!session || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
}
```

This pattern is used in all `/api/admin/batch/*` endpoints (ban, unban, delete, set-role, create-test-users).

## Admin Bootstrap

`src/auth/admin-bootstrap.ts` handles first-admin setup without requiring an existing admin:

- **`checkHasAdmins()`** — returns whether any admin exists (or `null` if the caller has no session)
- **`promoteToAdmin()`** — promotes the current user to admin, but only if no admin exists yet

These are server functions (`"use server"`) used by the admin bootstrap UI.

## Test User Utilities

`src/auth/test-users.ts` provides admin-only helpers for managing test accounts:

- **`requireAdmin()`** — verifies the caller is authenticated with `role === "admin"`, used to protect the functions below
- **`createTestUsers(count)`** — bulk-creates `testuser<N>@example.com` accounts with random passwords
- **`getNextTestUserNumber()`** — returns the next available test user number

## Nav Role-Based Display

The nav component (`src/components/nav/Nav.tsx`) conditionally shows an "Admin" link when `session.user.role === "admin"`.

## How to Assign / Remove Roles

Roles are assigned via the admin API. The caller must have admin privileges.

```ts
// Set a user's role
await authClient.admin.setRole({
    userId: "target-user-id",
    role: "admin", // or "user"
});

// Remove admin — set back to default
await authClient.admin.setRole({
    userId: "target-user-id",
    role: "user",
});
```

## Adding Custom Permissions

The app currently uses only the default better-auth admin permissions. To add custom ones, define an access control statement and pass it to both the server and client configs. See the [better-auth access control docs](https://www.better-auth.com/docs/plugins/admin#access-control) for details.

## Key Files

| File                           | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| `src/auth/core.ts`             | Server-side auth config with admin plugin            |
| `src/auth/auth-client.ts`      | Client-side auth with adminClient plugin             |
| `src/auth/require-auth.ts`     | Route guard that checks auth + permissions           |
| `src/auth/admin-bootstrap.ts`  | First-admin bootstrap (check/promote)                |
| `src/auth/test-users.ts`       | Admin-only test user management utilities            |
| `src/database/schemas/auth.ts` | User/session/account schema (includes `role` column) |
| `src/routes/forbidden.tsx`     | 403 page shown when permissions fail                 |
| `src/routes/api/admin/batch/*` | Admin-only batch API endpoints                       |
