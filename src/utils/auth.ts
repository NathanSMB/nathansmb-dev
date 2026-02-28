import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { connection } from "~/database/connection";
import * as schema from "~/database/schema";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    database: drizzleAdapter(connection, {
        provider: "pg",
        schema
    }),
});
