import * as Slider from "@radix-ui/react-slider";
import { Fullscreen, Mute, PlayPause, Timestamp } from "@react-av/controls";
import * as Media from "@react-av/core";
import { ProgressBarRoot, VolumeRoot } from "@react-av/sliders";
import { StrictMode } from "react";
import { render } from "vitest-browser-react";
import clip from "./fixtures/clip.webm";

const sliderStyle = { display: "block", position: "relative", width: 200, height: 12 } as const;
const thumbStyle = { display: "block", width: 12, height: 12, background: "black" } as const;

export async function renderPlayer(videoProps: Media.VideoProps = {}) {
    const screen = await render(
        <StrictMode>
            <Media.Root>
                <Media.Container>
                    <Media.Video src={clip} {...videoProps} />
                </Media.Container>
                <Media.Viewport>
                    <PlayPause />
                    <ProgressBarRoot style={sliderStyle}>
                        <Slider.Thumb aria-label="Seek" style={thumbStyle} />
                    </ProgressBarRoot>
                    <Timestamp type="elapsed" />
                    <Mute />
                    <VolumeRoot style={sliderStyle}>
                        <Slider.Thumb aria-label="Volume" style={thumbStyle} />
                    </VolumeRoot>
                    <Fullscreen />
                </Media.Viewport>
            </Media.Root>
        </StrictMode>,
    );
    return screen.container.querySelector("video")!;
}
