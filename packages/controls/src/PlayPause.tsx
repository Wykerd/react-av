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

    const playingState = readyState >= MediaReadyState.HAVE_CURRENT_DATA ?
        playing ?
            "playing" : 
            "paused" :
        "loading";

    return <button 
        data-media-play-state={playingState} 
        onClick={() => setPlaying(!playing)}
        ref={ref}
        {...btnProps}
        className={
            (className + " " + (readyState >= MediaReadyState.HAVE_CURRENT_DATA ?
                playing ?
                    playingClassName :
                    pausedClassName :
                loadingClassName)).trim() || undefined
        }
        type="button"
        disabled={playingState === "loading"}
        aria-label={playing ? "Pause" : "Play"}
    >
        {
            readyState >= MediaReadyState.HAVE_CURRENT_DATA ?
                playing ?
                    pauseIcon : 
                    playIcon :
                loadingIcon
        }
    </button>
});

export default PlayPause;
