


export interface ISerializable {
    serialize(): Buffer;
}

export interface IPixelLayer extends ISerializable {
    name:             number;
    x:                number;
    y:                number;
    width:            number;
    height:           number;
    readonly texture: GPUTexture;
}

export interface IP2Document extends ISerializable {
    name:            string;
    width:           number;
    height:          number;
    readonly layers: IPixelLayer[];
}