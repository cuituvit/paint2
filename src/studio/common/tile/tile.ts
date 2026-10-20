import "./tile.css";

import { Freeform, FreeFormOptions } from "../dom/freeform.js";
import { Parameters } from "../../../common/parameters.js";
import { TabRenderer } from "./tileTabRenderer.js";



export type RendererInitParameters = Required<TileInitParameters> & {
    tile: Tile;
};

export interface IContentRenderer extends Disposable {
    init(parameters: RendererInitParameters): void;
    onShow?(): void;
    onHide?(): void;
    readonly element: HTMLElement;
}

export interface ITabRenderer extends Disposable {
    init(parameters: RendererInitParameters): void;
    readonly element: HTMLElement;
}

export type TileInitParameters = {
    title?:  string;
    params?: Parameters;
}

export interface Tile extends Disposable, Freeform {
    init(params: TileInitParameters): void;
    setTitle(_val?: string):          void;
    readonly content:                 IContentRenderer;
    readonly tab:                     ITabRenderer;
    readonly title:                   string | undefined;
    readonly params:                  Parameters | undefined;
    readonly pinned:                  boolean;
}

export type TileOptions = FreeFormOptions & TileInitParameters & {
    className?:      string;
    contentRenderer: IContentRenderer;
};

export class _TileImpl extends Freeform implements Tile {
    constructor(_options: TileOptions) {
        super(document.createElement("div"), _options);
        
        if (_options.className) {
            this.element.className = _options.className;
        }

        this.element.classList.add("tile");

        this._content = _options.contentRenderer;
        this._tab     = new TabRenderer;

        this._content.element.classList.add("content");
        this._tab.element.classList.add("tab");

        this.init({
            title:  _options.title??"",
            params: _options.params??{},
        });
    }

    [Symbol.dispose]() {
        this._content[Symbol.dispose]();
        this._tab[Symbol.dispose]();
    }

    setTitle(_val?: string) {
        if (_val === this._title) {
            return;
        }

        this._title = _val;
    }

    init(params: TileInitParameters) {
        this._params = params;

        const _params = {
            tile:   this,
            title:  params.title??"",
            params: params.params??{},
        };

        this.element.appendChild(this._tab.element);
        this.element.appendChild(this._content.element);

        this._content.init(_params);
        this._tab.init(_params);

        this.setTitle(params.title)
    }

    get content() {
        return this._content;
    }
    
    get tab() {
        return this._tab;
    }
    
    get title() {
        return this._title;
    }
    
    get params() {
        return this._params;
    }
    
    get pinned() {
        return this._pinned;
    }

    private _content: IContentRenderer;
    private _tab:     ITabRenderer;
    private _title?:  string;
    private _params?: Parameters;
    private _pinned   = false;
}

interface _TileConstructor {
    new(_options: TileOptions): Tile;
}

export const Tile: _TileConstructor = _TileImpl;