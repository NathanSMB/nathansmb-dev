import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
    plugins: [solid()],
    test: {
        environment: "jsdom",
        globals: true,
        include: ["tests/**/*.test.{ts,tsx}"],
        setupFiles: ["tests/setup.ts"],
    },
    resolve: {
        alias: {
            "~": new URL("./src", import.meta.url).pathname,
        },
    },
});
