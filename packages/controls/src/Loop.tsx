import { Repeat } from '@phosphor-icons/react';
import React, { ComponentPropsWithoutRef, forwardRef, RefAttributes } from 'react';
import { useMediaLoop } from '@react-av/core';

export type LoopProps = ComponentPropsWithoutRef<'button'> & {
    icon?: React.ReactNode;
    activeClassName?: string;
    defaultIconSize?: number;
}

const Loop: React.ForwardRefExoticComponent<LoopProps & RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, LoopProps>(function Loop(props, ref) {
    const [loop, setLoop] = useMediaLoop();

    const { 
        defaultIconSize = 32,
        icon = <Repeat weight='fill' size={defaultIconSize} />,
        className = "",
        activeClassName = "",
        ...btnProps
    } = props;

    return <button 
        data-media-loop-state={loop ? "loop" : "default"}
        onClick={() => setLoop(!loop)}
        ref={ref}
        {...btnProps}
        className={
            (className + " " + (loop ? activeClassName : "")).trim() || undefined
        }
        type="button"
        aria-label={loop ? "Turn off Repeat" : "Repeat"}
    >
        {
            icon
        }
    </button>
});

export default Loop;
