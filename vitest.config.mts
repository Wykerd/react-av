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
                    dedupe: ["react", "react-dom", "@radix-ui/react-slider"],
                },
                test: {
                    name: "e2e",
                    include: ["e2e/**/*.test.{ts,tsx}"],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        commands: {
                            async dragCue({ page, iframe }, text: string, deltaX: number, resize = false) {
                                const bounds = await iframe.locator("[data-timeline-sentry-index]").filter({ hasText: text }).boundingBox();
                                if (!bounds) throw new Error("Cue is not visible");
                                const x = bounds.x + (resize ? bounds.width - 2 : bounds.width / 2);
                                const y = bounds.y + bounds.height / 2;
                                await page.mouse.move(x, y);
                                await page.mouse.down();
                                await page.mouse.move(x + deltaX, y, { steps: 6 });
                                await page.mouse.up();
                            },
                            async createCue({ page, iframe }, start: number, end: number) {
                                const tape = iframe.locator("[data-timeline-sentry-index]").first().locator("..");
                                const bounds = await tape.boundingBox();
                                if (!bounds) throw new Error("Timeline is not visible");
                                const duration = await iframe.locator("video").evaluate(video => video.duration);
                                const y = bounds.y + 12;
                                await page.mouse.move(bounds.x + start / duration * bounds.width, y);
                                await page.mouse.down();
                                await page.mouse.move(bounds.x + end / duration * bounds.width, y, { steps: 6 });
                                await page.mouse.up();
                            },
                        },
                        instances: [{ browser: "chromium" }, { browser: "webkit" }],
                    },
                },
            },
        ],
    },
});
