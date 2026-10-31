import { IDisposable } from "../../../../common/disposable.js";
import { Parameters } from "../../../../common/utility.js";
import { IRenderer, RendererInitParameters } from "../../../common/browser/renderer.js";
import { Freeform } from "../../../common/dom/freeform.js";
import { IMasonryTile, MasonryTileInitParameters, MasonryTileOptions } from "../../../common/masonry.js";
import { _TileTabRenderer } from "./masonryTileTabRenderer.js";



export interface _ITabRenderer extends IDisposable {
    init(parameters: {title: string} & RendererInitParameters): void;
    readonly element: HTMLElement;
}

export class _MasonryTile extends Freeform implements IMasonryTile {
    constructor(_options: MasonryTileOptions) {
        super(document.createElement("div"), _options);

        if (_options.className) {
            this.element.className = _options.className;
        }

        this.element.classList.add("tile");

        this._content = _options.contentRenderer;
        this._tab     = new _TileTabRenderer;

        this._content.element.classList.add("content");
        this._tab.element.classList.add("tab");
    }

    dispose() {
        this._content.dispose();
        this._tab.dispose();
    }

    setTitle(_val?: string) {
        if (_val === this._title) {
            return;
        }

        this._title = _val;
    }

    init(_params: MasonryTileInitParameters) {
        if (_params.params) {
            _params.params.tile = this;
        } else {
            _params.params = {
                tile: this,
            }
        }

        this._params = _params;

        const _rendererParams: RendererInitParameters = {
            params: _params.params,
        };

        this.element.appendChild(this._tab.element);
        const _contentCont     = document.createElement('div');
        _contentCont.className = "content-container";
        this.element.appendChild(_contentCont);
        _contentCont.appendChild(this._content.element);

        this._content.init(_rendererParams);
        this._tab.init({
            title: _params.title??"",
            ..._rendererParams
        });

        this.setTitle(_params.title)
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

    private _content: IRenderer;
    private _tab:     _ITabRenderer;
    private _title?:  string;
    private _params?: Parameters;
    private _pinned   = false;
}