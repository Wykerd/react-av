import * as Slider from '@radix-ui/react-slider';
const SliderRoot = Slider.Root;
import React, { ComponentProps, ComponentPropsWithoutRef, forwardRef, RefAttributes } from 'react';
import { useMediaVolume } from '@react-av/core';

export type VolumeRootProps = Omit<ComponentProps<typeof SliderRoot>, "onValueChange" | "value" | "max" | "min"> & ComponentPropsWithoutRef<'span'>;

export const VolumeRoot: React.ForwardRefExoticComponent<VolumeRootProps & RefAttributes<HTMLSpanElement>> = forwardRef<HTMLSpanElement, VolumeRootProps>(function VolumeRoot({ children, step = 0.05, ...props }, ref) {
    const [volume, setVolume] = useMediaVolume();

    // TODO: I have no idea why this is throwing typescript errors, it works fine in the ProgressBarRoot file
    return <SliderRoot 
        ref={ref} {...props as any} 
        onValueChange={value => value[0] !== undefined && setVolume(value[0])} value={[volume]} 
        min={0} max={1} step={step}
    >
        {children}
    </SliderRoot>;
});
