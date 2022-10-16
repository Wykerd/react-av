import { toTimestampString } from "@react-av/controls";
import { useMediaDuration } from "@react-av/core";
import { ProgressBarTooltip, useMediaProgressBarTooltip } from "@react-av/sliders";

export default function StyledProgressBarTooltip() {
    const { percentage } = useMediaProgressBarTooltip();
    const duration = useMediaDuration();

    return <ProgressBarTooltip className="transition opacity-0 bg-slate-50 text-slate-900 text-xs p-1 rounded absolute -translate-x-1/2 -translate-y-[calc(50%_+_16px)]" position="center" showingClassName="opacity-100">
        {toTimestampString(duration * percentage, duration >= 3600)}
    </ProgressBarTooltip>
}