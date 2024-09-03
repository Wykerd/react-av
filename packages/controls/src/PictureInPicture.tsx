import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes, useEffect, useState } from 'react';
import { useMediaElement } from '@react-av/core';
import { PictureInPicture as PIPIcon } from '@phosphor-icons/react';

export type PIPProps = ComponentPropsWithoutRef<'button'> & {
    icon?: React.ReactNode;
    defaultIconSize?: number;
}

const PictureInPicture: React.ForwardRefExoticComponent<PIPProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, PIPProps>(function PictureInPicture(props, ref) {
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