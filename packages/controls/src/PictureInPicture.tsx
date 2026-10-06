import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes, useEffect, useState } from 'react';
import { MediaReadyState, useMediaElement, useMediaReadyState } from '@react-av/core';
import { PictureInPicture as PIPIcon } from '@phosphor-icons/react';

export type PIPProps = ComponentPropsWithoutRef<'button'> & {
    icon?: React.ReactNode;
    defaultIconSize?: number;
}

type PresentationVideo = HTMLVideoElement & {
    webkitSupportsPresentationMode?: (mode: string) => boolean;
    webkitSetPresentationMode?: (mode: string) => void;
    webkitPresentationMode?: string;
};

const PictureInPicture: React.ForwardRefExoticComponent<PIPProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, PIPProps>(function PictureInPicture(props, ref) {
    const element = useMediaElement();
    const readyState = useMediaReadyState();
    const [ pipSupported, setPipSupported ] = useState(false);

    useEffect(() => {
        if (element?.nodeName !== 'VIDEO') {
            setPipSupported(false);
            return;
        }
        const video = element as PresentationVideo;
        const standard = video.ownerDocument.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function';
        const webkit = typeof video.webkitSetPresentationMode === 'function' && video.webkitSupportsPresentationMode?.('picture-in-picture');
        setPipSupported(!video.disablePictureInPicture && Boolean(standard || webkit));
    }, [element, readyState]);

    const { 
        defaultIconSize = 32,
        icon = <PIPIcon weight='fill' size={defaultIconSize} />, 
        children = icon,
        disabled,
        onClick,
        ...btnProps 
    } = props;

    async function handlePictureInPicture() {
        if (element?.nodeName !== 'VIDEO') return;
        const video = element as PresentationVideo;
        const document = video.ownerDocument;
        try {
            if (document.pictureInPictureElement === video) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
                await video.requestPictureInPicture();
            } else if (video.webkitSupportsPresentationMode?.('picture-in-picture')) {
                const mode = video.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture';
                video.webkitSetPresentationMode?.(mode);
            }
        } catch {
            return;
        }
    }

    if (!pipSupported) 
        return null;

    return <button 
        ref={ref}
        type="button"
        {...btnProps}
        disabled={disabled || readyState < MediaReadyState.HAVE_CURRENT_DATA}
        aria-label="Toggle Picture-in-Picture"
        onClick={event => {
            onClick?.(event);
            if (!event.defaultPrevented) void handlePictureInPicture();
        }}
    >
        {children}
    </button>
});

export default PictureInPicture;
