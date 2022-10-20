import React, { forwardRef, useEffect, useState } from 'react';
import { useMediaElement } from '@react-av/core';
import { PictureInPicture as PIPIcon } from 'phosphor-react';

export type PIPProps =  React.HTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode;
    defaultIconSize?: number;
}

const PictureInPicture = forwardRef<HTMLButtonElement, PIPProps>(function PictureInPicture(props, ref) {
    const element = useMediaElement();
    const [ pipSupported, setPipSupported ] = useState(false);

    useEffect(() => {
        setPipSupported(globalThis?.document?.pictureInPictureEnabled || false);
    }, []);

    const { 
        defaultIconSize = 32,
        icon = <PIPIcon weight='fill' size={defaultIconSize} />, 
        ...btnProps 
    } = props;

    function handlePictureInPicture() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else if (element?.nodeName == "VIDEO") {
            (element as HTMLVideoElement)?.requestPictureInPicture();
        }
    }

    if (!pipSupported) 
        return null;

    return <button 
        ref={ref}
        type="button"
        {...btnProps}
        aria-label="Toggle Picture-in-Picture"
        onClick={handlePictureInPicture}
    >
        {icon}
    </button>
});

export default PictureInPicture;