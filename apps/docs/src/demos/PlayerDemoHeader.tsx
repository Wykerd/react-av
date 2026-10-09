import SkinTabs, { type SkinOption } from "./SkinTabs";

export type PlayerSkin = "ink" | "studio" | "broadcast";

const SKINS: SkinOption<PlayerSkin>[] = [
    { id: "ink", label: "Ink" },
    { id: "studio", label: "Studio" },
    { id: "broadcast", label: "Broadcast" },
];

export default function PlayerDemoHeader({ skin = "ink", onChange }: {
    skin?: PlayerSkin;
    onChange?: (skin: PlayerSkin) => void;
}) {
    return <div className="flex flex-wrap items-center justify-between gap-3">
        <SkinTabs label="Player skin" options={SKINS} value={skin} onChange={onChange} />
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">Same state · new markup</p>
    </div>;
}
