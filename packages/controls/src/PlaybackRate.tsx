import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes } from 'react';
import { useMediaPlaybackRate } from '@react-av/core';

export type PlaybackRateProps = ComponentPropsWithoutRef<'button'> & {
    rates?: readonly number[];
}

const DEFAULT_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const PlaybackRate: React.ForwardRefExoticComponent<PlaybackRateProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, PlaybackRateProps>(function PlaybackRate(props, ref) {
    const [playbackRate, setPlaybackRate] = useMediaPlaybackRate();

    const rateLabel = `${playbackRate}×`;

    const {
        rates = DEFAULT_RATES,
        children = rateLabel,
        ...btnProps
    } = props;

    function selectNextRate() {
        const fasterRates = rates.filter((rate) => rate > playbackRate);
        if (fasterRates.length > 0) {
            setPlaybackRate(Math.min(...fasterRates));
        } else {
            setPlaybackRate(Math.min(...rates));
        }
    }

    return <button
        onClick={selectNextRate}
        ref={ref}
        {...btnProps}
        type="button"
        aria-label={`Playback speed ${rateLabel}`}
    >
        {children}
    </button>
});

export default PlaybackRate;
