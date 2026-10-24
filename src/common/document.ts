


export interface PixelLayerOptions {
    name:   string;
    x?:     number;
    y?:     number;
    width:  number;
    height: number;
    device: GPUDevice;
}

export interface IPixelLayer {
    name:             string;
    x:                number;
    y:                number;
    width:            number;
    height:           number;
    readonly texture: GPUTexture;
}

export interface P2DocumentOptions extends Omit<PixelLayerOptions, "device" | "x" | "y"> {}

export interface IP2Document {
    name:            string;
    width:           number;
    height:          number;
    readonly layers: IPixelLayer[];
}