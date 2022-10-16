import { Root as SliderRoot } from '@radix-ui/react-slider';
import React, { ComponentProps, forwardRef } from 'react';
import { useMediaVolume } from '@react-av/core';

const VolumeRoot = forwardRef<HTMLSpanElement, Omit<ComponentProps<typeof SliderRoot>, "onValueChange" | "value" | "max" | "min" | "step">>(function VolumeRoot({children, ...props}, ref) {
    const [volume, setVolume] = useMediaVolume();

    return <SliderRoot ref={ref} {...props} onValueChange={value => value[0] && setVolume(value[0])} value={[volume]} min={0} max={1} step={0.0001}>
        {children}
    </SliderRoot>;
});

export default VolumeRoot;
