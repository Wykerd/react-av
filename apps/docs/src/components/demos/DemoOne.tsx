import { Fullscreen, Mute, PictureInPicture, PlayPause, Timestamp } from "@react-av/controls";
import { Container, Root, Video, Viewport } from "@react-av/core";
import { ProgressBarBufferedRanges, ProgressBarRoot, VolumeRoot } from "@react-av/sliders";
import { InterfaceOverlay, Track } from "@react-av/vtt";
import * as Slider from '@radix-ui/react-slider';
import { toTimestampString } from "@react-av/controls";
import { useMediaDuration } from "@react-av/core";
import { ProgressBarTooltip, useMediaProgressBarTooltip } from "@react-av/sliders";

const ButtonStyles = "p-1 bg-transparent focus-visible:bg-primeA-4 focus-visible:backdrop-blur hover:bg-primeA-4 hover:backdrop-blur rounded-md block text-white transition";

function StyledProgressBarTooltip() {
    const { percentage } = useMediaProgressBarTooltip();
    const duration = useMediaDuration();

    return <ProgressBarTooltip className="transition opacity-0 bg-grayA-9 backdrop-blur text-black text-xs py-0.5 px-2 rounded absolute -translate-x-1/2 -translate-y-[calc(50%_+_16px)]" position="center" showingClassName="opacity-100">
        {toTimestampString(duration * percentage, duration >= 3600)}
    </ProgressBarTooltip>
}

export default function DemoOne() {
    return <Root>
        <Container className="max-w-2xl relative bg-black flex items-center justify-center shadow-[0_0px_50px_0px_rgb(255_232_168_/_0.125)] sm:rounded-lg overflow-hidden">
            <Video src='https://storage.wykerd.dev/react-av/sprite-fright.mp4' className="max-w-full max-h-full grow" poster="/sprite-fright.jpg" />
        </Container>
        <Track kind="subtitles" srclang="en" label="English" src="/sprite-fright.vtt" id="default" default />
        <Viewport className="absolute top-0 bottom-0 left-0 right-0 w-full h-full z-10" inactiveClassName="cursor-none">
            <InterfaceOverlay className="absolute bottom-0 left-0 w-full transition cursor-default p-2 flex flex-row gap-2 items-center bg-gradient-to-t from-blackA-8 to-transparent pt-4" inactiveClassName="opacity-0">
                <PlayPause 
                    className={ButtonStyles}
                    defaultIconSize={21}
                />
                <ProgressBarRoot className="grow relative flex items-center select-none touch-none h-4">
                    <Slider.Track className="relative bg-slate-300/40 grow rounded-full h-2">
                        <ProgressBarBufferedRanges className="absolute h-full rounded-full bg-slate-300/40" />
                        <Slider.Range className="absolute h-full rounded-full bg-prime-10" />
                    </Slider.Track>
                    <StyledProgressBarTooltip />
                    <Slider.Thumb className="block w-4 h-4 rounded-full bg-slate-50 outline-none z-20" />
                </ProgressBarRoot>
                <Timestamp type="remaining" className="text-white text-xs font-mono" />
                <Mute
                    className={ButtonStyles}
                    defaultIconSize={21} 
                />
                <VolumeRoot className="w-20 relative hidden items-center select-none touch-none h-4 sm:flex">
                    <Slider.Track className="relative bg-slate-300/40 grow rounded-full h-2">
                        <Slider.Range className="absolute h-full rounded-full bg-prime-10" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 rounded-full bg-slate-50 outline-none z-20" />
                </VolumeRoot>
                <PictureInPicture
                    className={ButtonStyles}
                    defaultIconSize={21} 
                />
                <Fullscreen 
                    className={ButtonStyles}
                    defaultIconSize={21} 
                />
            </InterfaceOverlay>
        </Viewport>
    </Root>
}