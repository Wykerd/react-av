import { ArrowClockwise, ArrowCounterClockwise } from '@phosphor-icons/react';
import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes } from 'react';
import { useMediaStore } from '@react-av/core';

export type SkipProps = ComponentPropsWithoutRef<'button'> & {
    seconds?: number;
    icon?: React.ReactNode;
    defaultIconSize?: number;
}

function useSkip(offsetSeconds: number) {
    const store = useMediaStore();

    return function skip() {
        const element = store.mediaElement.getState();
        if (!element) return;
        store.currentTime.setState(element.currentTime + offsetSeconds);
    };
}

export const SkipBack: React.ForwardRefExoticComponent<SkipProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, SkipProps>(function SkipBack(props, ref) {
    const {
        seconds = 10,
        defaultIconSize = 32,
        icon = <ArrowCounterClockwise weight='fill' size={defaultIconSize} />,
        ...btnProps
    } = props;
    const skipBack = useSkip(-seconds);

    return <button
        onClick={skipBack}
        ref={ref}
        {...btnProps}
        type="button"
        aria-label={`Back ${seconds} seconds`}
    >
        {icon}
    </button>
});

export const SkipForward: React.ForwardRefExoticComponent<SkipProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, SkipProps>(function SkipForward(props, ref) {
    const {
        seconds = 10,
        defaultIconSize = 32,
        icon = <ArrowClockwise weight='fill' size={defaultIconSize} />,
        ...btnProps
    } = props;
    const skipForward = useSkip(seconds);

    return <button
        onClick={skipForward}
        ref={ref}
        {...btnProps}
        type="button"
        aria-label={`Forward ${seconds} seconds`}
    >
        {icon}
    </button>
});
