import { ClassicPreset } from "rete";

export type ImageSourceType = "url" | "upload" ;

export interface ImageControlData {
  sourceType: ImageSourceType;
  url: string;
  caption: string;
  variableName: string;
  fileName: string;
}

export class ImageControl extends ClassicPreset.Control {
  id = "image-control";

  constructor(
    public nodeId: string,
    public data: ImageControlData,
    public onChange: (patch: Partial<ImageControlData>) => void,
    public onResize: () => void
  ) {
    super();
  }
}