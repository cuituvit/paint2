import { IAppBase } from "../../common/appbase.js";
import { Component, createDecorator, IUnknown, registerSingleton } from "../../common/component.js";
import { IContentRenderer, Tile } from "./tile/tile.js";
import { Parameters } from "../../common/parameters.js";
import { AddTileOptions, CreateRendererOptions, Masonry } from "./masonry/masonry.js";



export interface IUiRenderers {
    registerContentRenderer(_name: string, _fn: ()=>IContentRenderer): void;
}

export interface IUiTiles {
    addTile: Masonry["addTile"];
}

export type IUi  = IUiRenderers & IUiTiles;
export const IUi = createDecorator<IUi>("layout");

class Ui extends Component implements IUi {
    constructor(
        @IAppBase
        private readonly appbase: IUnknown
    ) {
        super();

        const appbaseElement = this.appbase.queryInterface<IAppBase>("appbase").element;

        this._masonry = new Masonry(appbaseElement, {
            createContentRenderer: this._createContentRenderer,
        });

        this.registerInterface("renderers", this as IUiRenderers);
        this.registerInterface("tiles", this as IUiTiles);
    }

    dispose() {

    }

    registerContentRenderer(_name: string, _fn: () => IContentRenderer) {
        if (_DEV)
        if (this._contentRenderers.has(_name)) {
            console.warn(`Replacing ContentRenderer ${_name}`);
        }
        this._contentRenderers.set(_name, _fn);
    }

    private _createContentRenderer = (_options: CreateRendererOptions): IContentRenderer => {
        const _renderer = this._contentRenderers.get(_options.rendererName);
        if (!_renderer) {
            throw Error(`Content renderer ${_options.rendererName} missing`);
        }
        return _renderer();
    }

    addTile<_Ty extends object = Parameters>(_options: AddTileOptions): Tile | undefined {
        return this._masonry.addTile(_options);
    }

    private _masonry: Masonry;
    private _contentRenderers = new Map<string, ()=>IContentRenderer>();
}

registerSingleton(IUi, Ui);