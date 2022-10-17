import * as Media from '@react-av/core';
import { Track, useMediaTextTrack, Cue } from '@react-av/vtt';
import * as Slider from '@radix-ui/react-slider';
import { ProgressBarBufferedRanges, ProgressBarRoot, VolumeRoot } from "@react-av/sliders";
import { Mute, PlayPause, Timestamp } from '@react-av/controls';
import StyledProgressBarTooltip from './StyledProgressBarTooltip';

function Teleprompter() {
    const [cues, activeCues] = useMediaTextTrack('lyrics');
    const [, setCurrentTime] = Media.useMediaCurrentTime();

    return <ol className="h-[429px] grow overflow-auto">
        {
            cues.map((cue, i) => <Cue 
                key={i} 
                as="li" 
                cue={cue} 
                className={`${activeCues.includes(cue) ? "text-slate-900 scale-100" : "text-slate-500 scale-[60%] hover:scale-75"} font-bold text-xl origin-left transition`}
                ref={current => {
                    activeCues.includes(cue) && current?.scrollIntoView({behavior: "smooth", block: "center"});
                }}
                onClick={() => setCurrentTime(cue.startTime)}
                role="button"
            />)
        }
    </ol>
}

export default function AudioExample () {
    return <Media.Root>
        <Media.Audio src="./dinosaurchestra.mp3" />
        <Track kind="subtitles" language="en" label="English" src="./dinosaurchestra.vtt" id="lyrics" />
        <div className="flex flex-row w-full gap-4">
            <div className="max-w-md flex flex-col shrink-0">
                <img src="/dinosaurchestra.webp" width={384} height={384} className="w-96" />
                <div className="w-full bg-black/50 p-2 z-10 flex flex-row items-center gap-2 transition cursor-default">
                    <PlayPause 
                        className="p-1 bg-transparent focus-visible:bg-red-500 hover:bg-red-500 rounded-md block text-white transition" 
                        defaultIconSize={21} 
                    />
                    <ProgressBarRoot className="grow relative flex items-center select-none touch-none h-4">
                        <Slider.Track className="relative bg-slate-300/40 grow rounded-full h-2">
                            <ProgressBarBufferedRanges className="absolute h-full rounded-full bg-slate-300/40" />
                            <Slider.Range className="absolute h-full rounded-full bg-red-500" />
                        </Slider.Track>
                        <StyledProgressBarTooltip />
                        <Slider.Thumb className="block w-4 h-4 rounded-full bg-slate-50 outline-none z-20" />
                    </ProgressBarRoot>
                    <Timestamp type="remaining" className="text-white text-xs font-mono" />
                    <Mute
                        className="p-1 bg-transparent focus-visible:bg-red-500 hover:bg-red-500 rounded-md block text-white transition" 
                        defaultIconSize={21} 
                    />
                    <VolumeRoot className="w-20 relative flex items-center select-none touch-none h-4">
                        <Slider.Track className="relative bg-slate-300/40 grow rounded-full h-2">
                            <Slider.Range className="absolute h-full rounded-full bg-red-500" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-4 h-4 rounded-full bg-slate-50 outline-none z-20" />
                    </VolumeRoot>
                </div>
            </div>
            <Teleprompter />
        </div>
    </Media.Root>
}