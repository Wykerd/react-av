import { useState } from "react";
import * as Media from "@react-av/core";
import { Fullscreen, Mute, PictureInPicture, PlayPause, Timestamp, toTimestampString } from "@react-av/controls";
import { ProgressBarBufferedRanges, ProgressBarRoot, ProgressBarTooltip, VolumeRoot, useMediaProgressBarTooltip } from "@react-av/sliders";
import { InterfaceOverlay, Track } from "@react-av/vtt";
import * as Slider from "@radix-ui/react-slider";
import { ArrowsIn, ArrowsOut, CircleNotch, Pause, PictureInPicture as PipIcon, Play, SpeakerHigh, SpeakerLow, SpeakerNone, SpeakerX } from "@phosphor-icons/react";
import PlayerDemoHeader, { type PlayerSkin } from "./PlayerDemoHeader";

const CONTAINER_CLASSES: Record<PlayerSkin, string> = {
    ink: "border border-ink",
    studio: "rounded-2xl shadow-[0_40px_80px_-30px_rgb(23_22_15/0.55)]",
    broadcast: "outline-[6px] outline-offset-0 outline-ink",
};

function SeekTooltip({ className }: { className: string }) {
    const { percentage } = useMediaProgressBarTooltip();
    const duration = Media.useMediaDuration();
    return <ProgressBarTooltip
        className={`pointer-events-none absolute -translate-x-1/2 opacity-0 transition-opacity ${className}`}
        showingClassName="opacity-100"
        position="center"
    >
        {toTimestampString(duration * percentage, duration >= 3600)}
    </ProgressBarTooltip>;
}

const INK_BUTTON = "grid size-8 place-items-center border border-ink/0 text-ink transition-colors hover:border-ink focus-visible:border-ink focus-visible:outline-none";

function InkControls() {
    const duration = Media.useMediaDuration();
    const icon = { weight: "light", size: 18 } as const;
    return <div
        className="flex shrink-0 items-center gap-2 border-t border-ink bg-paper px-2 py-1.5 text-ink"
    >
        <PlayPause
            className={INK_BUTTON}
            playIcon={<Play {...icon} />}
            pauseIcon={<Pause {...icon} />}
            loadingIcon={<CircleNotch {...icon} className="animate-spin" />}
        />
        <span className="hidden font-mono text-[10px] tabular-nums sm:inline">
            <Timestamp type="elapsed" /> <span className="text-ink-soft">/ <Timestamp type="duration" /></span>
        </span>
        <ProgressBarRoot style={{ visibility: duration > 0 ? "visible" : "hidden" }} className="relative mx-1 flex h-6 grow touch-none select-none items-center">
            <Slider.Track className="relative h-px grow bg-ink/25">
                <ProgressBarBufferedRanges className="absolute h-full bg-ink/40" />
                <Slider.Range className="absolute h-full bg-ink" />
            </Slider.Track>
            <SeekTooltip className="-top-7 border border-ink bg-paper px-1.5 py-0.5 font-mono text-[10px]" />
            <Slider.Thumb aria-label="Seek" className="block size-2.5 rotate-45 border border-ink bg-paper outline-none focus-visible:bg-signal" />
        </ProgressBarRoot>
        <Mute
            className={INK_BUTTON}
            highIcon={<SpeakerHigh {...icon} />}
            lowIcon={<SpeakerLow {...icon} />}
            noneIcon={<SpeakerNone {...icon} />}
            mutedIcon={<SpeakerX {...icon} />}
        />
        <PictureInPicture className={`${INK_BUTTON} max-sm:hidden`} icon={<PipIcon {...icon} />} />
        <Fullscreen className={INK_BUTTON} fullscreenIcon={<ArrowsOut {...icon} />} exitFullscreenIcon={<ArrowsIn {...icon} />} />
    </div>;
}

const STUDIO_BUTTON = "grid size-9 place-items-center rounded-full text-white/90 transition hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none";

function StudioControls() {
    const icon = { weight: "fill", size: 18 } as const;
    return <InterfaceOverlay
        className="absolute inset-x-3 bottom-3 flex items-center gap-1 rounded-full border border-white/10 bg-neutral-950/55 px-2 py-1 text-white backdrop-blur-xl transition duration-300 sm:inset-x-6 sm:bottom-5"
        inactiveClassName="translate-y-3 opacity-0"
    >
        <PlayPause
            className={STUDIO_BUTTON}
            playIcon={<Play {...icon} />}
            pauseIcon={<Pause {...icon} />}
            loadingIcon={<CircleNotch weight="bold" size={18} className="animate-spin" />}
        />
        <ProgressBarRoot className="relative mx-2 flex h-6 grow touch-none select-none items-center">
            <Slider.Track className="relative h-1 grow overflow-hidden rounded-full bg-white/20">
                <ProgressBarBufferedRanges className="absolute h-full bg-white/25" />
                <Slider.Range className="absolute h-full rounded-full bg-signal" />
            </Slider.Track>
            <SeekTooltip className="-top-9 rounded-md bg-white px-2 py-1 font-mono text-[10px] text-neutral-900" />
            <Slider.Thumb aria-label="Seek" className="block size-3.5 rounded-full bg-white shadow outline-none ring-signal/50 focus-visible:ring-4" />
        </ProgressBarRoot>
        <Timestamp type="remaining" className="w-12 text-right font-mono text-[11px] tabular-nums text-white/80" />
        <Mute
            className={STUDIO_BUTTON}
            highIcon={<SpeakerHigh {...icon} />}
            lowIcon={<SpeakerLow {...icon} />}
            noneIcon={<SpeakerNone {...icon} />}
            mutedIcon={<SpeakerX {...icon} />}
        />
        <VolumeRoot className="relative hidden h-6 w-16 touch-none select-none items-center md:flex">
            <Slider.Track className="relative h-1 grow rounded-full bg-white/20">
                <Slider.Range className="absolute h-full rounded-full bg-white" />
            </Slider.Track>
            <Slider.Thumb aria-label="Volume" className="block size-3 rounded-full bg-white outline-none" />
        </VolumeRoot>
        <Fullscreen className={STUDIO_BUTTON} fullscreenIcon={<ArrowsOut {...icon} />} exitFullscreenIcon={<ArrowsIn {...icon} />} />
    </InterfaceOverlay>;
}

function BroadcastPlayLabel() {
    const [playing] = Media.useMediaPlaying();
    return <>{playing ? "Pause" : "Play"}</>;
}

function BroadcastMuteLabel() {
    const [muted] = Media.useMediaMuted();
    return <>{muted ? "Sound on" : "Mute"}</>;
}

const BROADCAST_BUTTON = "bg-white px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-signal hover:text-white focus-visible:bg-signal focus-visible:text-white focus-visible:outline-none";

function BroadcastControls() {
    return <InterfaceOverlay
        className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-t from-black/70 to-transparent p-3 pt-10 transition-opacity duration-300 sm:p-4 sm:pt-12"
        inactiveClassName="opacity-0"
    >
        <ProgressBarRoot className="relative flex h-4 w-full touch-none select-none items-center">
            <Slider.Track className="relative h-1.5 grow bg-white/30">
                <ProgressBarBufferedRanges className="absolute h-full bg-white/40" />
                <Slider.Range className="absolute h-full bg-signal" />
            </Slider.Track>
            <SeekTooltip className="-top-8 bg-signal px-2 py-1 font-mono text-[10px] font-semibold text-white" />
            <Slider.Thumb aria-label="Seek" className="block h-4 w-1.5 bg-white outline-none focus-visible:bg-signal" />
        </ProgressBarRoot>
        <div className="flex items-stretch gap-1">
            <div className="flex items-center gap-2 bg-ink px-3 font-mono text-sm font-medium tabular-nums text-white sm:text-base">
                <span className="size-2 animate-pulse rounded-full bg-signal" />
                <Timestamp type="elapsed" />
            </div>
            <PlayPause className={BROADCAST_BUTTON} playIcon={<BroadcastPlayLabel />} pauseIcon={<BroadcastPlayLabel />} loadingIcon={<span>Loading</span>} />
            <Mute className={BROADCAST_BUTTON} highIcon={<BroadcastMuteLabel />} lowIcon={<BroadcastMuteLabel />} noneIcon={<BroadcastMuteLabel />} mutedIcon={<BroadcastMuteLabel />} />
            <span className="grow" />
            <Fullscreen className={BROADCAST_BUTTON} fullscreenIcon={<span>Full</span>} exitFullscreenIcon={<span>Exit</span>} />
        </div>
    </InterfaceOverlay>;
}

export default function PlayerDemo() {
    const [skin, setSkin] = useState<PlayerSkin>("ink");

    return <div className="flex flex-col gap-4">
        <PlayerDemoHeader skin={skin} onChange={setSkin} />
        <Media.Root loading="lazy">
            <Media.Container className={`player-demo relative overflow-hidden bg-ink transition-[border-radius,box-shadow] duration-500 ${CONTAINER_CLASSES[skin]}`}>
                <Media.Video
                    src="https://storage.wykerd.dev/react-av/sprite-fright.mp4"
                    poster="/sprite-fright.jpg"
                    playsInline
                    width={2048}
                    height={858}
                    className="block h-auto w-full"
                />
                {skin === "ink" && <InkControls />}
            </Media.Container>
            <Track kind="subtitles" srclang="en" label="English" src="/sprite-fright.vtt" id="player-captions" default />
            {skin !== "ink" && <Media.Viewport className="absolute inset-0 z-10" inactiveClassName="cursor-none">
                {skin === "studio" && <StudioControls />}
                {skin === "broadcast" && <BroadcastControls />}
            </Media.Viewport>}
        </Media.Root>
    </div>;
}
