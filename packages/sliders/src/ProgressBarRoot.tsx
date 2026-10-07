import * as Slider from '@radix-ui/react-slider';
const SliderRoot = Slider.Root;
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import React, { ComponentProps, ComponentPropsWithoutRef, createContext, forwardRef, MouseEvent, RefAttributes, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { useMediaCurrentTimeFine, useMediaDuration } from '@react-av/core';

export interface ProgressBarTooltipContextState {
    percentage: number;
    root: RefObject<HTMLSpanElement | null>;
    show: boolean;
};

export const ProgressBarTooltipContext = createContext<ProgressBarTooltipContextState | undefined>(undefined);

export function useMediaProgressBarTooltip() {
    const context = useContext(ProgressBarTooltipContext);
    if (!context) throw new Error('useMediaProgressBarTooltip must be used within a ProgressBarTooltipContext');
    return context;
}

export type ProgressBarRootProps = Omit<ComponentProps<typeof SliderRoot>, "onValueChange" | "value" | "max" | "min" | "step"> & ComponentPropsWithoutRef<'span'>;

export const ProgressBarRoot: React.ForwardRefExoticComponent<ProgressBarRootProps & RefAttributes<HTMLSpanElement>> = forwardRef<HTMLSpanElement, ProgressBarRootProps>(function ProgressBarRoot({children, disabled, ...props}, ref) {
    const [currentTime, setCurrentTime] = useMediaCurrentTimeFine();
    const internalRef = useRef<HTMLSpanElement>(null);
    const duration = useMediaDuration();
    const hasDuration = Number.isFinite(duration) && duration > 0;
    const [state, setState] = useState<ProgressBarTooltipContextState>({
        percentage: 0,
        root: internalRef,
        show: false,
    });

    const {isHovered, hoverProps} = useHover({ isDisabled: disabled || !hasDuration });

    useEffect(() => {
        setState(state => ({
            ...state,
            show: isHovered,
        }));
    }, [isHovered]);

    // TODO: vertical
    function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
        const cursor = e.clientX;
        const rect = internalRef.current?.getBoundingClientRect();
        if (!rect) return;
        if (cursor < rect.left || cursor > rect.right) return;
        const percentage = (cursor - rect.left) / rect.width;
        setState(state => ({
            ...state,
            percentage
        }));
    }

    return <ProgressBarTooltipContext.Provider value={state}>
        <SliderRoot 
            ref={current => {
                if (typeof ref === "function") ref(current);
                // @ts-ignore
                else if (ref) ref.current = current;
                // @ts-ignore
                internalRef.current = current;
            }} 
            {...mergeProps(props, hoverProps)} 
            onMouseMove={handleMouseMove} 
            onValueChange={value => {
                const time = value[0];
                if (time === undefined || !hasDuration) return;
                setCurrentTime(time);
                setState(state => ({
                    ...state,
                    percentage: time / duration,
                }));
            }} 
            disabled={disabled || !hasDuration}
            value={[hasDuration ? currentTime : 0]}
            min={0} max={hasDuration ? duration : 1} step={0.001}
        >
            {children}
        </SliderRoot>
    </ProgressBarTooltipContext.Provider>;
});
