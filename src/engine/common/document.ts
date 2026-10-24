import { IP2Document, IPixelLayer, P2DocumentOptions, PixelLayerOptions } from "../../common/document.js";



export class PixelLayer implements IPixelLayer {
    constructor(_options: PixelLayerOptions) {
        this._name   = _options.name;
        this._x      = _options.x ?? 0;
        this._y      = _options.y ?? 0;
        this._width  = _options.width;
        this._height = _options.height;

        this._texture = _options.device.createTexture({
            size: {
                width:  _options.width,
                height: _options.height,
            },
            format: "rgba8unorm",
            usage:
                GPUTextureUsage.TEXTURE_BINDING | 
                GPUTextureUsage.COPY_DST        | 
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }

    get name() {
        return this._name;
    }

    get x() {
        return this._x;
    }
    
    get y() {
        return this._y;
    }
    
    get width() {
        return this._width;
    }
    
    get height() {
        return this._height;
    }

    get texture() {
        return this._texture;
    }

    private _name:    string;
    private _x:       number;
    private _y:       number;
    private _width:   number;
    private _height:  number;
    private _texture: GPUTexture;
}

export class P2Document implements IP2Document {
    constructor(_options: P2DocumentOptions) {
        this._name   = _options.name;
        this._width  = _options.width;
        this._height = _options.height;
    }

    get name() {
        return this._name;
    }
    
    get width() {
        return this._width;
    }
    
    get height() {
        return this._height;
    }

    get layers() {
        return this._layers;
    }

    private _name:    string;
    private _width:   number;
    private _height:  number;
    private _layers = [] as PixelLayer[];
}