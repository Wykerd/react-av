import * as Media from '@react-av/core';
import { Track, InterfaceOverlay } from '@react-av/vtt';
import * as Slider from '@radix-ui/react-slider';
import { ProgressBarBufferedRanges, ProgressBarRoot, VolumeRoot } from "@react-av/sliders";
import { Fullscreen, Mute, PictureInPicture, PlayPause, Timestamp } from '@react-av/controls';
import StyledProgressBarTooltip from './StyledProgressBarTooltip';

export default function VideoExample() {
    return <Media.Root>
        <div className="rounded-md overflow-hidden">
            <Media.Container className="max-w-5xl w-full relative bg-black flex items-center justify-center">
                <Media.Video src="./sprite-fright.webm" poster="./sprite-fright.jpg" className="max-w-full max-h-full grow" />
            </Media.Container>
        </div>
        <Track kind="subtitles" language="en" label="English" src="./sprite-fright.vtt" id="default" />
        <Media.Viewport className="absolute top-0 bottom-0 left-0 right-0 w-full h-full z-10" inactiveClassName="cursor-none">
            <InterfaceOverlay className="absolute bottom-0 w-full bg-black/50 p-2 z-10 flex flex-row items-center gap-2 transition cursor-default" inactiveClassName="opacity-0">
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
                <PictureInPicture
                    className="p-1 bg-transparent focus-visible:bg-red-500 hover:bg-red-500 rounded-md block text-white transition" 
                    defaultIconSize={21} 
                />
                <Fullscreen 
                    className="p-1 bg-transparent focus-visible:bg-red-500 hover:bg-red-500 rounded-md block text-white transition" 
                    defaultIconSize={21} 
                />
            </InterfaceOverlay>
        </Media.Viewport>
    </Media.Root>
}