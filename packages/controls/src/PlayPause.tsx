import { Pause, Play, Spinner } from 'phosphor-react';
import React, { forwardRef } from 'react';
import { MediaReadyState, useMediaPlaying, useMediaReadyState } from '@react-av/core';

export type PlayProps = React.HTMLAttributes<HTMLButtonElement> & {
    playIcon?: React.ReactNode;
    playingClassName?: string;
    pauseIcon?: React.ReactNode;
    pausedClassName?: string;
    loadingIcon?: React.ReactNode;
    loadingClassName?: string;
    defaultIconSize?: number;
}

const PlayPause = forwardRef<HTMLButtonElement, PlayProps>(function PlayPause(props, ref) {
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
        data-play-state={playingState} 
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
