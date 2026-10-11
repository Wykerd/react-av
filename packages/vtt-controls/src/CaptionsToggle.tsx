import { ClosedCaptioning } from '@phosphor-icons/react';
import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes, useEffect, useRef } from 'react';
import { useMediaElement } from '@react-av/core';
import { useMediaTextTrackList } from '@react-av/vtt';
import VTT, { TextTrack } from '@react-av/vtt-core';

export type CaptionsToggleProps = ComponentPropsWithoutRef<'button'> & {
    icon?: React.ReactNode;
    activeClassName?: string;
    defaultIconSize?: number;
}

function isCaptionTrack(track: TextTrack) {
    return track.kind === "captions" || track.kind === "subtitles";
}

const CaptionsToggle: React.ForwardRefExoticComponent<CaptionsToggleProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, CaptionsToggleProps>(function CaptionsToggle(props, ref) {
    const media = useMediaElement();
    const tracks = useMediaTextTrackList();
    const lastShownTrack = useRef<TextTrack | undefined>(undefined);

    const {
        defaultIconSize = 32,
        icon = <ClosedCaptioning weight='fill' size={defaultIconSize} />,
        className = "",
        activeClassName = "",
        ...btnProps
    } = props;

    const captionTracks = tracks?.filter(isCaptionTrack) ?? [];
    const showingTracks = captionTracks.filter(track => track.mode === "showing");
    const captionsOn = showingTracks.length > 0;
    const showingTrack = showingTracks[0];

    useEffect(() => {
        if (showingTrack) lastShownTrack.current = showingTrack;
    }, [showingTrack]);

    function toggleCaptions() {
        if (!media) return;
        if (captionsOn) {
            lastShownTrack.current = showingTracks[0];
            for (const track of showingTracks) {
                track.mode = "hidden";
            }
        } else {
            let track = captionTracks[0];
            if (lastShownTrack.current && captionTracks.includes(lastShownTrack.current)) {
                track = lastShownTrack.current;
            }
            track.mode = "showing";
        }
        const context = VTT.getContext(media);
        context?.tracksChanged.dispatchEvent(new CustomEvent("change", { detail: context }));
        VTT.updateTextTrackDisplay(media, captionTracks);
    }

    return <button
        data-media-captions-state={captionsOn ? "on" : "off"}
        onClick={toggleCaptions}
        ref={ref}
        {...btnProps}
        className={(className + " " + (captionsOn ? activeClassName : "")).trim() || undefined}
        type="button"
        aria-label="Captions"
        aria-pressed={captionsOn}
        disabled={captionTracks.length === 0}
    >
        {icon}
    </button>
});

export default CaptionsToggle;
