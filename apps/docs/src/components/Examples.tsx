import { useState } from "react"
import AudioExample from "./AudioExample";
import VideoExample from "./VideoExample";
import { MusicNoteSimple, VideoCamera } from 'phosphor-react';

export default function Examples() {
    const [isAudioExample, setIsAudioExample] = useState(false);
    return <section className="flex flex-col gap-2 w-full max-w-7xl items-center">
        <div className="flex flex-row gap-1 p-1 bg-slate-300 rounded-md">
            <button className={"p-2 rounded flex flex-row gap-1 items-center transition" + (!isAudioExample ? " bg-slate-50" : " hover:bg-slate-200")} onClick={() => setIsAudioExample(false)}>
                <VideoCamera size={16} />
                Video
            </button>
            <button className={"p-2 rounded flex flex-row gap-1 items-center transition" + (isAudioExample ? " bg-slate-50" : " hover:bg-slate-200")} onClick={() => setIsAudioExample(true)}>
                <MusicNoteSimple size={16} />
                Audio
            </button>
        </div>
        {
            isAudioExample ? <AudioExample /> : <VideoExample />
        }
        {
            isAudioExample ? <span className="text-xs">
                <a href="https://lemondemon.bandcamp.com/track/dinosaurchestra-part-three" target="blank">Dinosaurchesra Part Three by Lemon Demon</a> is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/" target="blank">CC BY-NC-SA 3.0</a>.
            </span> : <span className="text-xs">
                <a href="https://www.youtube.com/watch?v=_cMxraX_5RE" target="blank">Sprite Fright by Blender Studio</a> is licensed under <a href="https://studio.blender.org/films/sprite-fright/pages/about/" target="blank">CC BY 1.0</a> by <a href="https://studio.blender.org" target="blank">Blender Foundation</a>.
            </span>
        }
    </section>
}