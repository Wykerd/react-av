import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const packageSources = fileURLToPath(new URL("./packages/$1/src", import.meta.url));

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: "unit",
                    environment: "node",
                    include: ["packages/*/test/**/*.test.ts"],
                },
            },
            {
                resolve: {
                    alias: [{ find: /^@react-av\/([\w-]+)$/, replacement: packageSources }],
                    dedupe: ["react", "react-dom", "@radix-ui/react-slider", "@radix-ui/react-select"],
                },
                test: {
                    name: "e2e",
                    include: ["e2e/**/*.test.{ts,tsx}"],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: "chromium" }, { browser: "webkit" }],
                    },
                },
            },
        ],
    },
});
