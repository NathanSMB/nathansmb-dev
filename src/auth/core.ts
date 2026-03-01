import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { connection } from "~/database/connection";
import * as schema from "~/database/schema";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    plugins: [admin()],
    user: {
        changeEmail: {
            enabled: true,
            updateEmailWithoutVerification: true,
        },
    },
    database: drizzleAdapter(connection, {
        provider: "pg",
        schema
    }),
});
