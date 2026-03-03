# Permissions

The app uses the **better-auth admin plugin** for role-based access control.

## Current Configuration

**Server** (`src/utils/auth.ts`): Imports `admin` from `better-auth/plugins` and adds it to the auth config with default settings.

**Client** (`src/utils/auth-client.ts`): Imports `adminClient` from `better-auth/client/plugins` and adds it to the auth client.

**Database** (`src/database/schemas/auth.ts`): The `user` table has a `role` column (text), plus `banned`, `banReason`, and `banExpires` fields. The `session` table has `impersonatedBy` for admin impersonation.

**Route guard** (`src/utils/require-auth.ts`): The `requireAuth()` helper checks if a user is logged in and optionally checks permissions. If the user lacks permissions, they're redirected to `/forbidden`.

## Default Roles & Permissions

Out of the box (no custom access control defined yet), better-auth provides two roles:

| Role    | Description                         |
| ------- | ----------------------------------- |
| `user`  | Default role, no admin capabilities |
| `admin` | Full control over user management   |

Default permission **resources** and **actions**:

- **user**: `create`, `list`, `set-role`, `ban`, `impersonate`, `impersonate-admins`, `delete`, `set-password`
- **session**: `list`, `revoke`, `delete`

## How to Check Permissions

### Client-side (in a component)

```ts
// Using the requireAuth helper (redirects to /forbidden if denied)
import { requireAuth } from "~/utils/require-auth";

export default function AdminPage() {
    const session = requireAuth({
        permissions: { user: ["list", "ban"] },
    });
    // ...
}
```

### Client-side (programmatic check)

```ts
import { authClient } from "~/utils/auth-client";

// Async check - hits the server
const result = await authClient.admin.hasPermission({
    permissions: { user: ["delete"] },
});
if (result.data?.success) {
    /* allowed */
}

// Sync check - checks role definition locally (no network call)
const allowed = authClient.admin.checkRolePermission({
    permissions: { user: ["delete"] },
    role: "admin",
});
```

### Server-side

```ts
import { auth } from "~/utils/auth";

await auth.api.userHasPermission({
    body: {
        userId: "some-user-id",
        permissions: { user: ["ban"] },
    },
});
```

## How to Assign / Remove Roles

Roles are assigned via the admin API. The caller must have admin privileges.

### Set a user's role

```ts
await authClient.admin.setRole({
    userId: "target-user-id",
    role: "admin", // or "user", or a custom role name
});
```

Multiple roles can be assigned (stored comma-separated in the `role` column).

### Remove a role

Set the user back to the default:

```ts
await authClient.admin.setRole({
    userId: "target-user-id",
    role: "user",
});
```

### Bootstrap an admin

To create the first admin without an existing admin, use the `adminUserIds` config option in `src/utils/auth.ts`:

```ts
export const auth = betterAuth({
    plugins: [
        admin({
            adminUserIds: ["your-user-id-here"],
        }),
    ],
    // ...
});
```

## How to Add Custom Permissions

The app currently uses only the default permissions. To add custom ones:

### 1. Define an access control statement

Create `src/utils/permissions.ts`:

```ts
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// Define your custom resources and actions
const statement = {
    ...defaultStatements,
    project: ["create", "update", "delete", "share"],
    post: ["create", "edit", "publish", "delete"],
} as const;

export const ac = createAccessControl(statement);

// Define roles with specific permissions
export const user = ac.newRole({
    project: ["create"],
    post: ["create", "edit"],
});

export const admin = ac.newRole({
    project: ["create", "update", "delete", "share"],
    post: ["create", "edit", "publish", "delete"],
    ...adminAc.statements, // include default admin permissions
});
```

### 2. Pass to server config

Update `src/utils/auth.ts`:

```ts
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, user } from "~/utils/permissions";

export const auth = betterAuth({
    plugins: [
        adminPlugin({
            ac,
            roles: { admin, user },
        }),
    ],
    // ...
});
```

### 3. Pass to client config

Update `src/utils/auth-client.ts`:

```ts
import { adminClient } from "better-auth/client/plugins";
import { ac, admin, user } from "~/utils/permissions";

export const authClient = createAuthClient({
    plugins: [
        adminClient({
            ac,
            roles: { admin, user },
        }),
    ],
});
```

### 4. Check custom permissions in components

```ts
const session = requireAuth({
    permissions: { project: ["create"] },
});
```

## Key Files

| File                           | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| `src/utils/auth.ts`            | Server-side auth config with admin plugin            |
| `src/utils/auth-client.ts`     | Client-side auth with adminClient plugin             |
| `src/utils/require-auth.ts`    | Route guard that checks auth + permissions           |
| `src/database/schemas/auth.ts` | User/session/account schema (includes `role` column) |
| `src/routes/forbidden.tsx`     | 403 page shown when permissions fail                 |
