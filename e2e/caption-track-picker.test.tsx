import * as Select from "@radix-ui/react-select";
import { Fullscreen, PlayPause } from "@react-av/controls";
import * as Media from "@react-av/core";
import { Track } from "@react-av/vtt";
import { CaptionTrackSelectItems, CaptionTrackSelectRoot, useMediaCaptionTracks } from "@react-av/vtt-controls";
import { StrictMode, useState } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import clip from "./fixtures/clip.webm";
import english from "./fixtures/english.vtt";
import french from "./fixtures/french.vtt";

function CaptionPicker({ container, label = "Captions", disabled = false }: {
    container: HTMLElement | null;
    label?: string;
    disabled?: boolean;
}) {
    return <CaptionTrackSelectRoot disabled={disabled}>
        <Select.Trigger aria-label={label}><Select.Value /></Select.Trigger>
        <Select.Portal container={container}>
            <Select.Content position="popper" style={{ background: "white", color: "black" }}>
                <Select.Viewport><CaptionTrackSelectItems /></Select.Viewport>
            </Select.Content>
        </Select.Portal>
    </CaptionTrackSelectRoot>;
}

function CaptionButtons() {
    const { tracks, select } = useMediaCaptionTracks();
    return <button onClick={() => select(tracks[0] ?? null)}>Use English</button>;
}

function CaptionPlayer({ label = "Captions", delayed = false, disabled = false, shared = false, delayedTracks = false, defaultEnglish = false }: {
    label?: string;
    delayed?: boolean;
    disabled?: boolean;
    shared?: boolean;
    delayedTracks?: boolean;
    defaultEnglish?: boolean;
}) {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [mounted, setMounted] = useState(!delayed);
    const [tracksMounted, setTracksMounted] = useState(!delayedTracks);
    return <Media.Root>
        <Media.Container ref={setContainer}>
            {mounted && <Media.Video src={clip} />}
            <PlayPause />
            <Fullscreen />
            <CaptionPicker container={container} label={label} disabled={disabled} />
            {shared && <CaptionButtons />}
            {!mounted && <button onClick={() => setMounted(true)}>Load player</button>}
            {!tracksMounted && <button onClick={() => setTracksMounted(true)}>Load captions</button>}
        </Media.Container>
        {mounted && tracksMounted && <>
            <Track kind="subtitles" srclang="en" label="English" src={english} default={defaultEnglish} />
            <Track kind="subtitles" srclang="fr" src={french} />
        </>}
    </Media.Root>;
}

async function chooseLanguage(label: string, language: string) {
    await userEvent.click(page.getByRole("combobox", { name: label, exact: true }));
    await userEvent.click(page.getByRole("option", { name: language, exact: true }));
}

async function pauseAfterPlayback() {
    await userEvent.click(page.getByRole("button", { name: "Play", exact: true }));
    const video = document.querySelector("video")!;
    await expect.poll(() => video.currentTime).toBeGreaterThan(0);
    await userEvent.click(page.getByRole("button", { name: "Pause", exact: true }));
}

test("captions loaded before first playback appear immediately when selected", async () => {
    const screen = await render(<StrictMode><CaptionPlayer delayedTracks /></StrictMode>);
    const video = screen.container.querySelector("video")!;
    await expect.poll(() => video.readyState).toBeGreaterThanOrEqual(2);
    await chooseLanguage("Captions", "Off");
    await userEvent.click(page.getByRole("button", { name: "Load captions" }));
    await chooseLanguage("Captions", "English");
    await expect.element(page.getByText("Hello, world")).toBeVisible();
    await chooseLanguage("Captions", "fr");
    await expect.element(page.getByText("Bonjour le monde")).toBeVisible();
    await expect.element(page.getByText("Hello, world")).not.toBeInTheDocument();
    await chooseLanguage("Captions", "Off");
    await expect.element(page.getByText("Bonjour le monde")).not.toBeInTheDocument();
    expect(video.currentTime).toBe(0);
    expect(video.paused).toBe(true);
});

test("default captions loaded after the video appear without starting playback", async () => {
    const screen = await render(<CaptionPlayer delayedTracks defaultEnglish />);
    const video = screen.container.querySelector("video")!;
    await expect.poll(() => video.readyState).toBeGreaterThanOrEqual(2);
    await chooseLanguage("Captions", "Off");
    await userEvent.click(page.getByRole("button", { name: "Load captions" }));
    await expect.element(page.getByText("Hello, world")).toBeVisible();
    await expect.element(page.getByRole("combobox", { name: "Captions" })).toHaveTextContent("English");
    expect(video.currentTime).toBe(0);
    expect(video.paused).toBe(true);
});

test("choosing a caption language while paused shows only its captions and Off hides them", async () => {
    await render(<StrictMode><CaptionPlayer /></StrictMode>);
    const captions = page.getByRole("combobox", { name: "Captions" });
    await expect.element(captions).toHaveTextContent("Off");
    await pauseAfterPlayback();

    await chooseLanguage("Captions", "English");
    await expect.element(captions).toHaveTextContent("English");
    await expect.element(page.getByText("Hello, world")).toBeVisible();
    await expect.element(captions).toHaveFocus();

    await chooseLanguage("Captions", "fr");
    await expect.element(page.getByText("Bonjour le monde")).toBeVisible();
    await expect.element(page.getByText("Hello, world")).not.toBeInTheDocument();

    await chooseLanguage("Captions", "Off");
    await expect.element(page.getByText("Bonjour le monde")).not.toBeInTheDocument();
    await expect.element(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
});

test("keyboard selection and Escape restore focus without changing the cancelled choice", async () => {
    await render(<CaptionPlayer />);
    const captions = page.getByRole("combobox", { name: "Captions" });
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(captions).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByRole("listbox")).toBeVisible();
    await userEvent.keyboard("{End}");
    await expect.element(page.getByRole("option", { name: "fr", exact: true })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(captions).toHaveTextContent("fr");
    await expect.element(captions).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByRole("listbox")).toBeVisible();
    await userEvent.keyboard("{Home}");
    await expect.element(page.getByRole("option", { name: "Off", exact: true })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(captions).toHaveTextContent("fr");
    await expect.element(captions).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByRole("listbox")).toBeVisible();
    await userEvent.keyboard("English");
    await expect.element(page.getByRole("option", { name: "English", exact: true })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(captions).toHaveTextContent("English");
    await expect.element(page.getByText("Hello, world")).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Play", exact: true })).toBeVisible();
});

test("caption choices stay local to each player and follow other caption controls", async () => {
    await render(<StrictMode>
        <CaptionPlayer label="First captions" shared />
        <CaptionPlayer label="Second captions" />
    </StrictMode>);
    await chooseLanguage("Second captions", "fr");
    await userEvent.click(page.getByRole("button", { name: "Use English" }));
    await expect.element(page.getByRole("combobox", { name: "First captions" })).toHaveTextContent("English");
    await expect.element(page.getByRole("combobox", { name: "Second captions" })).toHaveTextContent("fr");
    await expect.element(page.getByText("Hello, world")).toBeVisible();
    await expect.element(page.getByText("Bonjour le monde")).toBeVisible();
    await chooseLanguage("First captions", "Off");
    await expect.element(page.getByText("Hello, world")).not.toBeInTheDocument();
    await expect.element(page.getByText("Bonjour le monde")).toBeVisible();
    await expect.element(page.getByRole("combobox", { name: "Second captions" })).toHaveTextContent("fr");
});

test("caption options become available when the player mounts later and disabled pickers stay disabled", async () => {
    await render(<CaptionPlayer delayed />);
    await chooseLanguage("Captions", "Off");
    await userEvent.click(page.getByRole("button", { name: "Load player" }));
    await chooseLanguage("Captions", "English");
    await expect.element(page.getByRole("combobox", { name: "Captions" })).toHaveTextContent("English");
    await expect.element(page.getByText("Hello, world")).toBeVisible();
    await render(<CaptionPlayer label="Disabled captions" disabled />);
    await expect.element(page.getByRole("combobox", { name: "Disabled captions" })).toBeDisabled();
});

test("the caption popup stays usable inside the fullscreen player", async () => {
    await render(<CaptionPlayer />);
    await pauseAfterPlayback();
    await userEvent.click(page.getByRole("button", { name: "Enter Fullscreen" }));
    await expect.element(page.getByRole("button", { name: "Exit Fullscreen" })).toBeVisible();
    await chooseLanguage("Captions", "English");
    await expect.element(page.getByRole("combobox", { name: "Captions" })).toHaveTextContent("English");
    await expect.element(page.getByRole("combobox", { name: "Captions" })).toHaveFocus();
    await expect.element(page.getByText("Hello, world")).toBeVisible();
    await userEvent.click(page.getByRole("button", { name: "Exit Fullscreen" }));
    await expect.element(page.getByRole("button", { name: "Enter Fullscreen" })).toBeVisible();
});
