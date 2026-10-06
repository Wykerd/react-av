import { Pause, Play, Spinner } from '@phosphor-icons/react';
import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes } from 'react';
import { MediaReadyState, useMediaPlaying, useMediaReadyState } from '@react-av/core';

export type PlayProps = ComponentPropsWithoutRef<'button'> & {
    playIcon?: React.ReactNode;
    playingClassName?: string;
    pauseIcon?: React.ReactNode;
    pausedClassName?: string;
    loadingIcon?: React.ReactNode;
    loadingClassName?: string;
    defaultIconSize?: number;
}

const PlayPause: React.ForwardRefExoticComponent<PlayProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, PlayProps>(function PlayPause(props, ref) {
    const [playing, setPlaying] = useMediaPlaying();
    const readyState = useMediaReadyState();

    const { 
        defaultIconSize = 32,
        playIcon = <Play weight='fill' size={defaultIconSize} />, 
        pauseIcon = <Pause weight='fill' size={defaultIconSize} />, 
        loadingIcon = <Spinner weight='fill' size={defaultIconSize} />,
        className = "",
        playingClassName = "",
        pausedClassName = "",
        loadingClassName = "",
        ...btnProps
    } = props;

    let playingState = "paused";
    let stateClassName = pausedClassName;
    let icon = playIcon;
    if (playing) {
        playingState = "playing";
        stateClassName = playingClassName;
        icon = pauseIcon;
        if (readyState < MediaReadyState.HAVE_FUTURE_DATA) {
            playingState = "loading";
            stateClassName = loadingClassName;
            icon = loadingIcon;
        }
    }

    return <button 
        data-media-play-state={playingState} 
        onClick={() => setPlaying(!playing)}
        ref={ref}
        {...btnProps}
        className={`${className} ${stateClassName}`.trim() || undefined}
        type="button"
        aria-label={playing ? "Pause" : "Play"}
    >
        {icon}
    </button>
});

export default PlayPause;
