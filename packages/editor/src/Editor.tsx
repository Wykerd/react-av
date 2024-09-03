import * as Media from "@react-av/core"
import React, { useState, type CSSProperties } from "react"
import { VideoRatio } from "./VideoRatio";

export interface EditorStyling {
    mediaContainer?: string | CSSProperties;
    editorContainer?: string | CSSProperties;
    timelineReelContainer?: string | CSSProperties;
    timelineHeaderReelContainer?: string | CSSProperties;
    timelineBaseReelContainer?: string | CSSProperties;
    timelinePlayheadLine?: string | CSSProperties;
    timelineTrackTape?: string | CSSProperties;
    timelineDragElementBase?: string | CSSProperties;
    timelineDragElementSelected?: string | CSSProperties;
    timelineDraftElementBase?: string | CSSProperties;
    timelineTimelineElementBase?: string | CSSProperties;
    timelineTimelineElement?: string | CSSProperties;
    timelineEntryLabelContainer?: string | CSSProperties;
    timelineEntryLabelTextContainer?: string | CSSProperties;
    timelineEntryLabelText?: string | CSSProperties;
    timelineEntryLabelControlsContainer?: string | CSSProperties;
}

export interface EditorPropsCommon {
    styling?: EditorStyling,
    fallbackAspectRatio?: number,
    children?: React.ReactNode
}

export type EditorProps = EditorPropsCommon & ({
    audioOnly: true;
    mediaComponent: React.ReactElement<typeof Media.Audio>
} | {
    audioOnly?: false;
    mediaComponent: React.ReactElement<typeof Media.Video>
})

export interface EditorContextValue {
    isAudioOnly: boolean,
    styling?: EditorStyling,
}

const EditorContext = React.createContext<EditorContextValue | null>(null);

export function useEditorContext() {
    const context = React.useContext(EditorContext);
    if (!context) {
        throw new Error('useEditorContext must be used within an Editor component');
    }
    return context;
}

export function Editor({
    styling, 
    fallbackAspectRatio = 16 / 9,
    children,
    ...mediaProps
}: EditorProps) {
    const [aspectRatio, setAspectRatio] = useState(() => fallbackAspectRatio);
    return <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            overflow: 'hidden',
            ...(typeof styling?.editorContainer === 'string' ? {} : styling?.editorContainer)
        } as CSSProperties}
        className={typeof styling?.editorContainer === 'string' ? styling.editorContainer : undefined}
    >
        {
            mediaProps.audioOnly ?
                <div
                    style={{
                        width: '100%',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                        gap: '1rem',
                        background: 'hsl(0, 0%, 88.7%)',
                        ...(typeof styling?.mediaContainer === 'string' ? {} : styling?.mediaContainer)
                    }} 
                    className={typeof styling?.mediaContainer === 'string' ? styling.mediaContainer : undefined}
                >
                    {
                        mediaProps.mediaComponent
                    }
                </div> :
                <Media.Container 
                    style={{
                        '--aspect-ratio': aspectRatio,
                        '--media-width': 'min(100%, (100% / var(--container-aspect-ratio)) * var(--aspect-ratio))',
                        '--container-aspect-ratio': 'max(calc(16 / 9), calc(var(--aspect-ratio)))',
                        background: 'hsl(0, 0%, 88.7%)',
                        width: '100%',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                        ...(typeof styling?.mediaContainer === 'string' ? {} : styling?.mediaContainer)
                    } as CSSProperties} 
                    className={typeof styling?.mediaContainer === 'string' ? styling.mediaContainer : undefined}
                >
                    {
                        // TODO: this type as unknown stuff is hacky, should find a better way to do this
                        React.cloneElement(mediaProps.mediaComponent, {
                            style: {
                                ...(mediaProps.mediaComponent.props as unknown as { style: CSSProperties }).style,
                                width: 'var(--media-width)',
                                display: 'block'
                            }
                        } as unknown as React.ComponentProps<typeof Media.Video>)
                    }
                </Media.Container>
        }
        <VideoRatio fallback={fallbackAspectRatio} onAspectRatio={setAspectRatio} />
        <EditorContext.Provider value={{
            isAudioOnly: !!mediaProps.audioOnly,
            styling: styling
        }}>
            {
                children
            }
        </EditorContext.Provider>
    </div>
}
