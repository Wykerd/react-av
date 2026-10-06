import { useState, type ReactElement } from "react";
import { Root, Video } from "@react-av/core";
import {
    Editor,
    TimelineContainer,
    TimelineControlBar,
    TimelineEditor,
    TimelineEntryLabel,
    TimelineHeader,
    TimelineSubtitleCueEditor,
    TimelineSubtitlesTrack,
    type EditorStyling,
    type TimelineControlBarStyling,
    type TimelineHeaderStyling,
    type TimelineSubtitleCueEditorStylingProps,
} from "@react-av/editor";
import { Track } from "@react-av/vtt";
import { Check, CircleNotch, ClosedCaptioning, MagnifyingGlassMinus, MagnifyingGlassPlus, Pause, Play, Subtitles, Trash } from "@phosphor-icons/react";
import SkinTabs, { type SkinOption } from "./SkinTabs";

type EditorSkin = "paper" | "studio" | "classroom";

const SKINS: SkinOption<EditorSkin>[] = [
    { id: "paper", label: "Paper" },
    { id: "studio", label: "Studio" },
    { id: "classroom", label: "Classroom" },
];

interface EditorSkinDefinition {
    frame: string;
    editor: EditorStyling;
    controlBar: TimelineControlBarStyling;
    header: TimelineHeaderStyling;
    cueEditor: TimelineSubtitleCueEditorStylingProps;
    trackLabel: { icon: ReactElement; label: string };
}

const paper: EditorSkinDefinition = {
    frame: "border border-ink bg-paper text-ink",
    editor: {
        mediaContainer: "!bg-ink",
        timelineBaseReelContainer: "border-b border-l border-line",
        timelinePlayheadLine: "top-0 h-full w-px bg-signal",
        timelineDragElementBase: "bg-ink/10",
        timelineDragElementSelected: "cursor-move bg-ink text-paper",
        timelineDraftElementBase: "bg-signal/30",
        timelineTimelineElement: "flex items-center px-2 font-mono text-[10px] cursor-pointer",
        timelineTimelineElementBase: "border border-ink bg-paper",
        timelineEntryLabelContainer: "flex items-center gap-2 border-b border-line px-3 text-ink",
        timelineEntryLabelTextContainer: "flex grow items-center gap-2",
        timelineEntryLabelText: "font-mono text-[10px] uppercase tracking-[0.12em]",
        timelineEntryLabelControlsContainer: "flex items-center gap-2",
    },
    controlBar: {
        timelineControlBarContainer: "border-y border-ink px-2 py-1",
        timelineControlBarPlayPauseButton: "grid size-8 place-items-center border border-transparent hover:border-ink",
        timelineControlBarPlayIcon: <Play weight="light" size={18} />,
        timelineControlBarPauseIcon: <Pause weight="light" size={18} />,
        timelineControlBarPlayPauseLoadingIcon: <CircleNotch weight="light" size={18} className="animate-spin" />,
        timelineControlBarZoomButton: "grid size-7 place-items-center border border-transparent hover:border-ink",
        timelineControlBarZoomInIcon: <MagnifyingGlassPlus weight="light" size={16} />,
        timelineControlBarZoomOutIcon: <MagnifyingGlassMinus weight="light" size={16} />,
        timelineControlBarZoomTextContainer: "font-mono text-[10px] text-ink-soft",
    },
    header: {
        timelineHeaderTimestampInputContainer: "flex items-center border-b border-line p-2",
        timelineHeaderTimestampInput: "w-full min-w-28 border border-ink bg-paper px-1.5 py-1 font-mono text-[11px] text-ink",
        timelineHeaderTimestampIndicator: "h-full overflow-hidden whitespace-nowrap border-l border-line p-2 font-mono text-[9px] text-ink-soft",
        timelineHeaderPlayhead: "bottom-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-signal",
    },
    cueEditor: {
        timelineSubtitleCueEditorPanelTitleContainer: "flex items-center border-b border-line p-4 font-mono text-[10px] uppercase tracking-[0.12em]",
        timelineSubtitleCueEditorContainer: "flex flex-col gap-2 border-b border-line p-4",
        timelineSubtitleCueEditorCueContentLabel: "font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft",
        timelineSubtitleCueEditorCueContentField: "w-full border border-ink bg-paper p-2 text-sm text-ink",
        timelineSubtitleCueEditorActionsContainer: "flex flex-col justify-end gap-2 md:flex-row",
        timelineSubtitleCueEditorBaseButton: "flex items-center justify-center gap-2 border border-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        timelineSubtitleCueEditorFocusTimelineButton: "scale-0 opacity-0 focus:scale-100 focus:opacity-100",
        timelineSubtitleCueEditorDeleteButton: "hover:bg-ink hover:text-paper",
        timelineSubtitleCueEditorDeleteIcon: <Trash weight="light" size={14} />,
        timelineSubtitleCueEditorDoneButton: "bg-ink text-paper hover:bg-signal hover:border-signal",
        timelineSubtitleCueEditorDoneIcon: <Check weight="light" size={14} />,
    },
    trackLabel: { icon: <Subtitles weight="light" size={16} />, label: "Captions" },
};

const studio: EditorSkinDefinition = {
    frame: "rounded-xl border border-white/10 bg-neutral-950 text-neutral-200 shadow-[0_40px_80px_-30px_rgb(23_22_15/0.6)] overflow-hidden",
    editor: {
        mediaContainer: "!bg-black",
        timelineBaseReelContainer: "border-b border-l border-white/10",
        timelinePlayheadLine: "top-0 h-full w-0.5 bg-signal shadow-[0_0_12px_rgb(255_79_0/0.8)]",
        timelineDragElementBase: "bg-signal/10",
        timelineDragElementSelected: "cursor-move bg-signal text-white",
        timelineDraftElementBase: "bg-signal/40",
        timelineTimelineElement: "flex items-center rounded px-2 text-xs cursor-pointer",
        timelineTimelineElementBase: "bg-signal/20 text-orange-100 ring-1 ring-inset ring-signal/50",
        timelineEntryLabelContainer: "flex items-center gap-2 border-b border-white/10 bg-neutral-900 px-3 text-neutral-400",
        timelineEntryLabelTextContainer: "flex grow items-center gap-2",
        timelineEntryLabelText: "text-xs font-medium",
        timelineEntryLabelControlsContainer: "flex items-center gap-2",
    },
    controlBar: {
        timelineControlBarContainer: "border-b border-white/10 bg-neutral-900 px-2 py-1",
        timelineControlBarPlayPauseButton: "grid size-8 place-items-center rounded-md text-white hover:bg-white/10",
        timelineControlBarPlayIcon: <Play weight="fill" size={16} />,
        timelineControlBarPauseIcon: <Pause weight="fill" size={16} />,
        timelineControlBarPlayPauseLoadingIcon: <CircleNotch weight="bold" size={16} className="animate-spin" />,
        timelineControlBarZoomButton: "grid size-7 place-items-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white",
        timelineControlBarZoomTextContainer: "text-xs text-neutral-500",
    },
    header: {
        timelineHeaderTimestampInputContainer: "flex items-center border-b border-white/10 bg-neutral-900 p-2",
        timelineHeaderTimestampInput: "w-full min-w-28 rounded-md bg-black px-2 py-1 font-mono text-xs text-signal ring-1 ring-white/10",
        timelineHeaderTimestampIndicator: "h-full overflow-hidden whitespace-nowrap border-l border-white/10 p-2 text-[10px] text-neutral-500",
        timelineHeaderPlayhead: "bottom-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-signal",
    },
    cueEditor: {
        timelineSubtitleCueEditorPanelTitleContainer: "flex items-center border-b border-white/10 bg-neutral-900 p-4 text-sm font-medium",
        timelineSubtitleCueEditorContainer: "flex flex-col gap-2 border-b border-white/10 p-4",
        timelineSubtitleCueEditorCueContentLabel: "text-xs text-neutral-500",
        timelineSubtitleCueEditorCueContentField: "w-full rounded-md bg-black p-2 text-sm text-white ring-1 ring-white/10 focus:ring-signal focus:outline-none",
        timelineSubtitleCueEditorActionsContainer: "flex flex-col justify-end gap-2 md:flex-row",
        timelineSubtitleCueEditorBaseButton: "flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium",
        timelineSubtitleCueEditorFocusTimelineButton: "scale-0 opacity-0 focus:scale-100 focus:opacity-100",
        timelineSubtitleCueEditorDeleteButton: "bg-white/5 text-neutral-300 hover:bg-white/10",
        timelineSubtitleCueEditorDeleteIcon: <Trash weight="bold" size={14} />,
        timelineSubtitleCueEditorDoneButton: "bg-signal text-white hover:brightness-110",
        timelineSubtitleCueEditorDoneIcon: <Check weight="bold" size={14} />,
    },
    trackLabel: { icon: <ClosedCaptioning weight="fill" size={16} />, label: "Subtitles" },
};

const classroom: EditorSkinDefinition = {
    frame: "rounded-[28px] bg-white p-3 text-slate-700 shadow-[0_24px_60px_-28px_rgb(67_56_202/0.45)] ring-1 ring-indigo-100",
    editor: {
        mediaContainer: "!bg-indigo-950 rounded-2xl",
        timelineBaseReelContainer: "border-l border-indigo-50",
        timelinePlayheadLine: "top-0 h-full w-0.5 rounded-full bg-indigo-500",
        timelineDragElementBase: "bg-indigo-100/70 rounded-full",
        timelineDragElementSelected: "cursor-move rounded-full bg-indigo-600 text-white",
        timelineDraftElementBase: "rounded-full bg-amber-200",
        timelineTimelineElement: "flex items-center rounded-full px-3 text-xs font-medium cursor-pointer",
        timelineTimelineElementBase: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
        timelineEntryLabelContainer: "flex items-center gap-2 px-3 text-indigo-600",
        timelineEntryLabelTextContainer: "flex grow items-center gap-2",
        timelineEntryLabelText: "text-sm font-semibold",
        timelineEntryLabelControlsContainer: "flex items-center gap-2",
    },
    controlBar: {
        timelineControlBarContainer: "px-1 py-2",
        timelineControlBarPlayPauseButton: "grid size-10 place-items-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500",
        timelineControlBarPlayIcon: <Play weight="fill" size={16} />,
        timelineControlBarPauseIcon: <Pause weight="fill" size={16} />,
        timelineControlBarPlayPauseLoadingIcon: <CircleNotch weight="bold" size={16} className="animate-spin" />,
        timelineControlBarZoomButton: "grid size-8 place-items-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
        timelineControlBarZoomTextContainer: "text-xs font-medium text-slate-500",
        timelineControlBarZoomTextTemplate: interval => `${interval}s steps`,
    },
    header: {
        timelineHeaderTimestampInputContainer: "flex items-center p-2",
        timelineHeaderTimestampInput: "w-full min-w-28 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700",
        timelineHeaderTimestampIndicator: "h-full overflow-hidden whitespace-nowrap p-2 text-[10px] font-medium text-slate-400",
        timelineHeaderPlayhead: "bottom-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-indigo-500",
    },
    cueEditor: {
        timelineSubtitleCueEditorPanelTitleText: "Edit line",
        timelineSubtitleCueEditorPanelTitleContainer: "flex items-center p-4 text-sm font-semibold text-indigo-600",
        timelineSubtitleCueEditorContainer: "m-2 flex flex-col gap-2 rounded-2xl bg-indigo-50/60 p-4",
        timelineSubtitleCueEditorCueContentLabel: "text-xs font-semibold text-slate-500",
        timelineSubtitleCueEditorCueContentLabelText: "What learners will read",
        timelineSubtitleCueEditorCueContentField: "w-full rounded-xl bg-white p-3 text-sm text-slate-800 ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-400 focus:outline-none",
        timelineSubtitleCueEditorActionsContainer: "flex flex-col justify-end gap-2 md:flex-row",
        timelineSubtitleCueEditorBaseButton: "flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold",
        timelineSubtitleCueEditorFocusTimelineButton: "scale-0 opacity-0 focus:scale-100 focus:opacity-100",
        timelineSubtitleCueEditorDeleteButton: "bg-white text-rose-600 ring-1 ring-rose-100 hover:bg-rose-50",
        timelineSubtitleCueEditorDeleteIcon: <Trash weight="bold" size={14} />,
        timelineSubtitleCueEditorDoneButton: "bg-indigo-600 text-white hover:bg-indigo-500",
        timelineSubtitleCueEditorDoneIcon: <Check weight="bold" size={14} />,
    },
    trackLabel: { icon: <Subtitles weight="duotone" size={18} />, label: "Captions" },
};

const DEFINITIONS: Record<EditorSkin, EditorSkinDefinition> = { paper, studio, classroom };

export default function EditorDemo() {
    const [skin, setSkin] = useState<EditorSkin>("paper");
    const definition = DEFINITIONS[skin];

    return <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <SkinTabs label="Editor skin" options={SKINS} value={skin} onChange={setSkin} />
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">Click a cue · drag to create</p>
        </div>
        <div className={`transition-[border-radius,background-color,color,box-shadow] duration-500 ${definition.frame}`}>
            <Root>
                <Track kind="subtitles" srclang="en" label="English" src="/sprite-fright.vtt" id="editor-captions" default />
                <Editor
                    mediaComponent={<Video src="https://storage.wykerd.dev/react-av/sprite-fright.mp4#t=17.4" poster="/sprite-fright.jpg" playsInline />}
                    styling={definition.editor}
                >
                    <TimelineEditor>
                        <TimelineControlBar styling={definition.controlBar} />
                        <TimelineContainer>
                            <TimelineHeader styling={definition.header} />
                            <TimelineSubtitlesTrack
                                id="editor-captions"
                                labelComponent={<TimelineEntryLabel icon={definition.trackLabel.icon} label={definition.trackLabel.label} />}
                            >
                                <TimelineSubtitleCueEditor styling={definition.cueEditor} />
                            </TimelineSubtitlesTrack>
                        </TimelineContainer>
                    </TimelineEditor>
                </Editor>
            </Root>
        </div>
    </div>;
}
