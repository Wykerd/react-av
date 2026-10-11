import * as Slider from '@radix-ui/react-slider';
import React, { ComponentProps, forwardRef, KeyboardEvent } from 'react';

type SliderRootProps = ComponentProps<typeof Slider.Root> & { keyboardStep?: number };

export const SliderRoot = forwardRef<HTMLSpanElement, SliderRootProps>(function SliderRoot({
    keyboardStep = 1, onKeyDown, value, min = 0, max = 100, disabled,
    orientation = 'horizontal', inverted = false, onValueChange, onValueCommit, ...props
}, ref) {
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        onKeyDown?.(event);
        const currentValue = value?.[0];
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'];
        if (event.defaultPrevented || disabled || currentValue === undefined || !keys.includes(event.key)) return;
        event.preventDefault();

        let backwardKeys = ['PageDown', 'ArrowDown', 'ArrowLeft'];
        if (orientation === 'vertical') {
            if (inverted) backwardKeys = ['PageDown', 'ArrowUp', 'ArrowLeft'];
        } else if ((event.currentTarget.dir === 'rtl') !== inverted) {
            backwardKeys = ['PageDown', 'ArrowDown', 'ArrowRight'];
        }

        const direction = backwardKeys.includes(event.key) ? -1 : 1;
        const multiplier = event.shiftKey || event.key.startsWith('Page') ? 10 : 1;
        const adjustedValue = Number((currentValue + direction * keyboardStep * multiplier).toPrecision(15));
        const nextValue = Math.min(max, Math.max(min, adjustedValue));
        if (nextValue === currentValue) return;
        onValueChange?.([nextValue]);
        onValueCommit?.([nextValue]);
    }

    return <Slider.Root
        {...props} ref={ref} value={value} min={min} max={max} disabled={disabled}
        orientation={orientation} inverted={inverted} onKeyDown={handleKeyDown}
        onValueChange={onValueChange} onValueCommit={onValueCommit}
    />;
});
