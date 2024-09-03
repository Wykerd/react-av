import * as Media from '@react-av/core';
import { Track, useMediaTextTrack, Cue } from '@react-av/vtt';
import * as Slider from '@radix-ui/react-slider';
import { ProgressBarBufferedRanges, ProgressBarRoot, VolumeRoot } from "@react-av/sliders";
import { Mute, PlayPause, Timestamp } from '@react-av/controls';
import { useRef } from 'react';

const ButtonStyles = "p-1 bg-transparent focus-visible:bg-prime-4 focus-visible:backdrop-blur hover:bg-prime-4 hover:backdrop-blur rounded-md block text-white transition";

function Teleprompter() {
    const [cues, activeCues] = useMediaTextTrack('lyrics');
    const [, setCurrentTime] = Media.useMediaCurrentTime();

    const containerRef = useRef<HTMLOListElement>(null);

    return <ol 
        className="h-80 sm:h-[429px] grow overflow-auto text-center sm:text-start px-2 sm:px-0 flex flex-col gap-2 z-10"
        ref={containerRef}
    >
        <div className='h-[214.5px] hidden sm:block shrink-0' />
        {
            cues.map((cue, i) => <Cue 
                key={i} 
                as="li" 
                cue={cue} 
                className={`${activeCues.includes(cue) ? "text-grayA-12" : "text-grayA-8 hover:text-grayA-11"} font-bold text-2xl origin-center sm:origin-left transition`}
                ref={current => {
                    if (!(current && containerRef.current)) return;
                    if (!activeCues.includes(cue)) return;

                    const elementRect = current.getBoundingClientRect();
                    const containerRect = containerRef.current.getBoundingClientRect();

                    const offsetTop = elementRect.top - containerRect.top + containerRef.current.scrollTop;

                    const centeringOffset = containerRect.height / 2 - elementRect.height / 2;

                    containerRef.current.scrollTo({
                        top: window.innerWidth <= 640 ? offsetTop : offsetTop - centeringOffset,
                        behavior: "smooth"
                    });
                }}
                onClick={() => setCurrentTime(cue.startTime)}
                role="button"
            />)
        }
        <div className='h-80 sm:h-[214.5px] block shrink-0' />
    </ol>
}

export default function DemoThree() {
    return <Media.Root>
        <Media.Audio src="https://storage.wykerd.dev/react-av/fine.mp3#t=0.1" />
        <Track kind="subtitles" srclang="en" label="English" src="/fine.vtt" id="lyrics" />
        <div className="flex flex-col sm:flex-row w-full gap-4 relative max-w-4xl">
            <div className='absolute top-0 left-0 w-full h-full opacity-60 blur-3xl' style={{
                background: 'url(/dinosaurchestra.jpeg) center/cover no-repeat',
            }} />
            <div className="max-w-xs mx-auto sm:mx-0 sm:max-w-md flex flex-col shrink-0 z-10 w-96 items-center">
                <img src="/dinosaurchestra.jpeg" width={384} height={384} className="w-48 sm:w-96" />
                <div className="w-full p-2 z-10 flex flex-row items-center gap-2 transition cursor-default">
                    <PlayPause 
                        className={ButtonStyles}
                        defaultIconSize={21} 
                    />
                    <ProgressBarRoot className="grow relative flex items-center select-none touch-none h-4">
                        <Slider.Track className="relative bg-slate-300/40 grow rounded-full h-2">
                            <ProgressBarBufferedRanges className="absolute h-full rounded-full bg-slate-300/40" />
                            <Slider.Range className="absolute h-full rounded-full bg-prime-10" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 rounded-full bg-slate-50 outline-none z-20" />
                    </ProgressBarRoot>
                    <Timestamp type="remaining" className="text-white text-xs font-mono" />
                    <Mute
                        className={ButtonStyles + " hidden sm:block"}
                        defaultIconSize={21} 
                    />
                    <VolumeRoot className="w-20 relative hidden sm:flex items-center select-none touch-none h-4">
                        <Slider.Track className="relative bg-slate-300/40 grow rounded-full h-2">
                            <Slider.Range className="absolute h-full rounded-full bg-prime-10" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 rounded-full bg-slate-50 outline-none z-20" />
                    </VolumeRoot>
                </div>
            </div>
            <Teleprompter />
        </div>
    </Media.Root>
}