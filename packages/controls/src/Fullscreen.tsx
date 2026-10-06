import { ArrowsInSimple, ArrowsOutSimple } from '@phosphor-icons/react';
import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes } from 'react';
import { useMediaFullscreen, useMediaFullscreenSupported } from '@react-av/core';

export type FullscreenProps = ComponentPropsWithoutRef<'button'> & {
    fullscreenIcon?: React.ReactNode;
    fullscreenClassName?: string;
    exitFullscreenIcon?: React.ReactNode;
    defaultClassName?: string;
    defaultIconSize?: number;
}

const Fullscreen: React.ForwardRefExoticComponent<FullscreenProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, FullscreenProps>(function Fullscreen(props, ref) {
    const [fullscreen, setFullscreen] = useMediaFullscreen();
    const supported = useMediaFullscreenSupported();

    const { 
        defaultIconSize = 32,
        fullscreenIcon = <ArrowsOutSimple weight='fill' size={defaultIconSize} />,
        exitFullscreenIcon = <ArrowsInSimple weight='fill' size={defaultIconSize} />,
        className = "",
        fullscreenClassName = "",
        defaultClassName = "",
        disabled,
        onClick,
        ...btnProps
    } = props;

    const playingState = fullscreen ? "fullscreen" : "default";

    return <button 
        data-media-fullscreen-state={playingState} 
        ref={ref}
        {...btnProps}
        onClick={event => {
            onClick?.(event);
            if (!event.defaultPrevented) setFullscreen(!fullscreen);
        }}
        disabled={disabled || !supported}
        className={
            (className + " " + (fullscreen ? fullscreenClassName : defaultClassName)).trim() || undefined
        }
        type="button"
        aria-label={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
        {
            fullscreen ? exitFullscreenIcon : fullscreenIcon
        }
    </button>
});

export default Fullscreen;
