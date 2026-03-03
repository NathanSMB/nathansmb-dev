import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "~/config/database";

export default defineConfig({
    out: "./drizzle",
    schema: "./src/database/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: DATABASE_URL,
    },
});
