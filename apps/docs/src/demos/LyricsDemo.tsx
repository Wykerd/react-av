import { useRef } from "react";
import * as Media from "@react-av/core";
import { Cue, Track, useMediaTextTrack } from "@react-av/vtt";
import { Mute, PlayPause, Timestamp } from "@react-av/controls";
import { ProgressBarBufferedRanges, ProgressBarRoot } from "@react-av/sliders";
import * as Slider from "@radix-ui/react-slider";
import { CircleNotch, Pause, Play, SpeakerHigh, SpeakerLow, SpeakerNone, SpeakerX } from "@phosphor-icons/react";

const BUTTON = "grid size-9 place-items-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper focus-visible:outline-none";

function Lyrics() {
    const [cues, activeCues] = useMediaTextTrack("lyrics");
    const [, setCurrentTime] = Media.useMediaCurrentTime();
    const listRef = useRef<HTMLOListElement>(null);

    return <ol ref={listRef} className="lyrics-mask relative h-80 overflow-y-auto overscroll-contain py-32 sm:h-[26rem] sm:py-44">
        {cues.map((cue, index) => {
            const active = activeCues.includes(cue);
            return <Cue
                key={index}
                as="li"
                cue={cue}
                role="button"
                tabIndex={0}
                onClick={() => setCurrentTime(cue.startTime)}
                onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setCurrentTime(cue.startTime);
                    }
                }}
                className={[
                    "cursor-pointer py-1 text-2xl font-semibold leading-snug tracking-tight transition-colors duration-300 sm:text-3xl",
                    active ? "text-ink" : "text-ink/20 hover:text-ink/50",
                ].join(" ")}
                ref={element => {
                    if (!element || !active || !listRef.current) return;
                    const list = listRef.current;
                    const offset = element.offsetTop - list.clientHeight / 2 + element.clientHeight / 2;
                    list.scrollTo({ top: offset, behavior: "smooth" });
                }}
            />;
        })}
    </ol>;
}

export default function LyricsDemo() {
    const icon = { weight: "light", size: 18 } as const;

    return <Media.Root>
        <Media.Audio src="https://storage.wykerd.dev/react-av/fine.mp3#t=0.1" />
        <Track kind="subtitles" srclang="en" label="English" src="/fine.vtt" id="lyrics" />
        <div className="grid gap-8 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-12">
            <div className="flex flex-col gap-4">
                <figure className="group relative border border-ink p-2">
                    <img
                        src="/dinosaurchestra.jpeg"
                        width={384}
                        height={384}
                        alt="Dinosaurchestra album cover by Lemon Demon"
                        className="aspect-square w-full grayscale transition duration-700 group-hover:grayscale-0"
                    />
                    <figcaption className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                        <span>Fine</span>
                        <span>Lemon Demon</span>
                    </figcaption>
                </figure>
                <div className="flex items-center gap-2">
                    <PlayPause
                        className={BUTTON}
                        playIcon={<Play {...icon} />}
                        pauseIcon={<Pause {...icon} />}
                        loadingIcon={<CircleNotch {...icon} className="animate-spin" />}
                    />
                    <ProgressBarRoot className="relative flex h-9 grow touch-none select-none items-center border border-ink px-3">
                        <Slider.Track className="relative h-px grow bg-ink/25">
                            <ProgressBarBufferedRanges className="absolute h-full bg-ink/40" />
                            <Slider.Range className="absolute h-full bg-ink" />
                        </Slider.Track>
                        <Slider.Thumb aria-label="Seek" className="block size-2.5 rotate-45 border border-ink bg-paper outline-none focus-visible:bg-signal" />
                    </ProgressBarRoot>
                    <Mute
                        className={BUTTON}
                        highIcon={<SpeakerHigh {...icon} />}
                        lowIcon={<SpeakerLow {...icon} />}
                        noneIcon={<SpeakerNone {...icon} />}
                        mutedIcon={<SpeakerX {...icon} />}
                    />
                </div>
                <div className="flex justify-between font-mono text-[10px] tabular-nums text-ink-soft">
                    <Timestamp type="elapsed" />
                    <Timestamp type="duration" />
                </div>
            </div>
            <Lyrics />
        </div>
    </Media.Root>;
}
