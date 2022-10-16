export type ScrollSetting = "" | "up";

export default interface VTTRegion {
    id: string;
    width: number;
    lines: number;
    regionAnchorX: number;
    regionAnchorY: number;
    viewportAnchorX: number;
    viewportAnchorY: number;
    scroll: ScrollSetting;
}

export default class VTTRegion implements VTTRegion {
    id: string = "";
    width: number = 100;
    lines: number = 3;
    regionAnchorX: number = 0;
    regionAnchorY: number = 100;
    viewportAnchorX: number = 0;
    viewportAnchorY: number = 100;
    scroll: ScrollSetting = "";
}
