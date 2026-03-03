import { createAuthClient } from "better-auth/solid";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [adminClient()],
});
