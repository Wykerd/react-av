import { defineConfig } from "vitest/config";

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
        ],
    },
});
