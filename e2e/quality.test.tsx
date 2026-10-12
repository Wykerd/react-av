import * as Media from "@react-av/core";
import { PlayPause } from "@react-av/controls";
import * as Shaka from "@react-av/shaka";
import { StrictMode } from "react";
import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";

function QualityPicker() {
    const { qualities, active, automatic, selectQuality } = Shaka.useMediaShakaQualities();
    return <>
        <select aria-label="Video quality" value={automatic ? "auto" : active?.id ?? "auto"} onChange={event => {
            const quality = qualities.find(quality => quality.id === Number(event.target.value));
            selectQuality(quality ?? "auto");
        }}>
            <option value="auto">Automatic</option>
            {qualities.map(quality => <option key={quality.id} value={quality.id}>{quality.height}p</option>)}
        </select>
        <output aria-label="Active quality">{active?.height ?? "Loading"}</output>
    </>;
}

function frameColour(video: HTMLVideoElement) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.drawImage(video, 0, 0);
    return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
}

const source = new URL("./fixtures/quality/manifest.mpd", import.meta.url).href;

test("select a streamed rendition, then return to automatic quality", async () => {
    const screen = await render(<StrictMode><Media.Root><Media.Container>
        <Shaka.Video src={source} format="dash" muted style={{ width: 320 }} />
        <PlayPause /><QualityPicker />
    </Media.Container></Media.Root></StrictMode>);
    const picker = page.getByRole("combobox", { name: "Video quality" });
    await expect.element(page.getByRole("option", { name: "90p" })).toBeInTheDocument();
    await userEvent.click(page.getByRole("button", { name: "Play" }));
    const video = screen.container.querySelector("video")!;
    await expect.poll(() => video.currentTime).toBeGreaterThan(0);
    await userEvent.selectOptions(picker, page.getByRole("option", { name: "90p" }));
    await expect.element(page.getByLabelText("Active quality")).toHaveTextContent("90");
    await expect.poll(() => frameColour(video)[2], { timeout: 5000 }).toBeGreaterThan(200);
    await userEvent.selectOptions(picker, page.getByRole("option", { name: "180p" }));
    await expect.element(page.getByLabelText("Active quality")).toHaveTextContent("180");
    await expect.poll(() => frameColour(video)[0], { timeout: 5000 }).toBeGreaterThan(200);
    await userEvent.selectOptions(picker, page.getByRole("option", { name: "Automatic" }));
    await expect.element(picker).toHaveValue("auto");
});

function IndependentPlayers() {
    return <StrictMode>{["First player", "Second player"].map(name => <section key={name} aria-label={name}>
        <Media.Root><Media.Container><Shaka.Video src={source} format="dash" muted /><QualityPicker /></Media.Container></Media.Root>
    </section>)}</StrictMode>;
}

test("choosing a rendition affects only its own player", async () => {
    await render(<IndependentPlayers />);
    const first = page.getByRole("region", { name: "First player" });
    const second = page.getByRole("region", { name: "Second player" });
    await expect.element(first.getByRole("option", { name: "90p" })).toBeInTheDocument();
    await expect.element(second.getByRole("option", { name: "180p" })).toBeInTheDocument();
    await userEvent.selectOptions(first.getByRole("combobox"), first.getByRole("option", { name: "90p" }));
    await expect.element(first.getByRole("combobox")).not.toHaveValue("auto");
    await expect.element(second.getByRole("combobox")).toHaveValue("auto");
    await expect.element(second.getByLabelText("Active quality")).toHaveTextContent("180");
});
