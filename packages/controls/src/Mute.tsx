import { SpeakerSimpleHigh, SpeakerSimpleNone, SpeakerSimpleX, SpeakerSimpleLow } from 'phosphor-react';
import React, { forwardRef } from 'react';
import { useMediaMuted, useMediaVolume } from '@react-av/core';

export type MuteProps = React.HTMLAttributes<HTMLButtonElement> & {
    highIcon?: React.ReactNode;
    highClassName?: string;
    lowIcon?: React.ReactNode;
    lowClassName?: string;
    noneIcon?: React.ReactNode;
    noneClassName?: string;
    mutedIcon?: React.ReactNode;
    mutedClassName?: string;
    defaultIconSize?: number;
}

const Mute = forwardRef<HTMLButtonElement, MuteProps>(function Mute(props, ref) {
    const [volume] = useMediaVolume();
    const [muted, setMuted] = useMediaMuted();

    const { 
        defaultIconSize = 32,
        highIcon = <SpeakerSimpleHigh weight='fill' size={defaultIconSize} />,
        lowIcon = <SpeakerSimpleLow weight='fill' size={defaultIconSize} />,
        noneIcon = <SpeakerSimpleNone weight='fill' size={defaultIconSize} />,
        mutedIcon = <SpeakerSimpleX weight='fill' size={defaultIconSize} />,
        className = "",
        highClassName = "",
        lowClassName = "",
        noneClassName = "",
        mutedClassName = "",
        ...btnProps
    } = props;

    const high = volume >= 0.5;
    const none = volume == 0;

    return <button 
        data-mute-state={muted ? "muted" : high ? "high" : none ? "none" : "low"}
        onClick={() => setMuted(!muted)}
        ref={ref}
        {...btnProps}
        className={
            (className + " " + (muted ?
                mutedClassName :
            high ?
                highClassName :
            none ?
                noneClassName :
                lowClassName)).trim() || undefined
        }
        type="button"
        aria-label={muted ? "Unmute" : "Mute"}
    >
        {
            muted ?
                mutedIcon :
            none ?
                noneIcon :
            high ?
                highIcon :
                lowIcon
        }
    </button>
});

export default Mute;
