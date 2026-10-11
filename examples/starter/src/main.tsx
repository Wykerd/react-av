import React from "react";
import { createRoot } from "react-dom/client";
import * as Media from "@react-av/core";
import { Fullscreen, Mute, PlayPause } from "@react-av/controls";
import { ProgressBarRoot, VolumeRoot } from "@react-av/sliders";
import * as Slider from "@radix-ui/react-slider";
import "./style.css";

function App() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  function handleSeekCommit(values: number[]) {
    if (values[0] === 0 && videoRef.current) videoRef.current.currentTime = 0;
  }
  function handleVolumeCommit(values: number[]) {
    if (values[0] === 0 && videoRef.current) videoRef.current.volume = 0;
  }
  return <main>
    <h1>React AV starter</h1>
    <p>A player you can style and make your own.</p>
    <Media.Root>
      <Media.Container className="player">
        <Media.Video ref={videoRef} src="/clip.webm" preload="auto" playsInline />
        <Media.Viewport>
          <div className="controls">
            <PlayPause />
            <ProgressBarRoot className="slider seek" onValueCommit={handleSeekCommit}>
              <Slider.Track><Slider.Range /></Slider.Track>
              <Slider.Thumb aria-label="Seek" />
            </ProgressBarRoot>
            <Mute />
            <VolumeRoot className="slider volume" onValueCommit={handleVolumeCommit}>
              <Slider.Track><Slider.Range /></Slider.Track>
              <Slider.Thumb aria-label="Volume" />
            </VolumeRoot>
            <Fullscreen />
          </div>
        </Media.Viewport>
      </Media.Container>
    </Media.Root>
  </main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
