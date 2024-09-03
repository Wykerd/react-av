import { Root, Video } from "@react-av/core";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Editor, TimelineContainer, TimelineControlBar, TimelineEditor, TimelineHeader, TimelineSubtitleCueEditor, TimelineSubtitlesTrack } from "@react-av/editor";
import { Track } from "@react-av/vtt";

export default function DemoTwo() {
    return <Root>
        <Track kind="subtitles" srclang="en" label="English" src="/sprite-fright.vtt" id="default" default />
        <Editor
            mediaComponent={<Video src='https://storage.wykerd.dev/react-av/sprite-fright.mp4' />}
            styling={{
                timelineBaseReelContainer: 'border-b border-l border-gray-6',
                timelineHeaderReelContainer: 'h-full',
                timelinePlayheadLine: 'bg-prime-11 top-0 h-full w-0.5',
                timelineDragElementBase: 'bg-primeA-4',
                timelineDragElementSelected: 'bg-primeA-8 cursor-move',
                timelineDraftElementBase: 'bg-primeA-6',
                timelineTimelineElement: 'text-xs items-center cursor-pointer',
                timelineTimelineElementBase: 'bg-primeA-7',
                timelineEntryLabelContainer: "flex flex-row gap-2 items-center px-2 border-b border-b-gray-6",
                timelineEntryLabelTextContainer: "flex flex-row grow items-center gap-2",
                timelineEntryLabelText: "text-sm text-gray-11",
                timelineEntryLabelControlsContainer: "flex flex-row items-center gap-2",
            }}
        >
            <TimelineEditor>
                <TimelineControlBar 
                    styling={{
                        timelineControlBarPlayPauseSpinner: 'animate-spin',
                        timelineControlBarPlayPauseButton: "cursor-pointer rounded bg-transparent hover:bg-prime-3 p-1 text-prime-11",
                        timelineControlBarZoomButton: 'rounded bg-transparent hover:bg-prime-3 text-prime-11 p-1 -m-1',
                        timelineControlBarZoomTextContainer: 'text-xs text-gray-11',
                    }}
                />
                <TimelineContainer>
                    <TimelineHeader 
                        styling={{
                            timelineHeaderTimestampInputContainer: 'flex flex-row gap-2 items-center p-2 border-b border-b-gray-6',
                            timelineHeaderTimestampInput: 'w-full min-w-28 text-sm rounded border border-gray-6 py-1 px-1.5 bg-gray-1 text-white',
                            timelineHeaderTimestampIndicator: 'border-l border-l-gray-6 h-full p-2 text-xs text-gray-11 overflow-hidden whitespace-nowrap',
                            timelineHeaderPlayhead: 'border-x-8 box-border border-x-transparent border-t-8 border-t-prime-11 bottom-0'
                        }}
                    />
                    {/* <TimelineAudioEntry interval={5} /> */}
                    <TimelineSubtitlesTrack id="default">
                        <TimelineSubtitleCueEditor 
                            styling={{
                                timelineSubtitleCueEditorPanelTitleContainer: 'flex flex-row gap-2 items-center p-4 border-b border-b-gray-6 border-l-8 border-l-gray-6',
                                timelineSubtitleCueEditorContainer: 'flex flex-col gap-2 p-4 border-b border-b-gray-6 border-r-8 border-r-gray-6',
                                timelineSubtitleCueEditorCueContentLabel: 'text-sm text-gray-11',
                                timelineSubtitleCueEditorCueContentField: 'w-full border border-gray-6 rounded p-1 text-sm bg-gray-1 text-white',
                                timelineSubtitleCueEditorActionsContainer: 'flex flex-col md:flex-row gap-2 justify-end',
                                timelineSubtitleCueEditorBaseButton: 'text-sm py-1 px-2 rounded flex flex-row gap-2 items-center justify-center',
                                timelineSubtitleCueEditorFocusTimelineButton: 'opacity-0 focus:opacity-100 scale-0 focus:scale-100',
                                timelineSubtitleCueEditorDeleteButton: 'bg-red-3 hover:bg-red-4 text-red-11',
                                timelineSubtitleCueEditorDeleteIcon: <Cross2Icon />,
                                timelineSubtitleCueEditorDoneButton: 'bg-prime-3 hover:bg-prime-4 text-prime-11',
                                timelineSubtitleCueEditorDoneIcon: <CheckIcon />
                            }}
                        />
                    </TimelineSubtitlesTrack>
                </TimelineContainer>
            </TimelineEditor>
        </Editor>
    </Root>
}