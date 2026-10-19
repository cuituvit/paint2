import "../components/components.js";

import {  getComponents, getContentRenderer, getTabRenderer } from "../components/common/registry.js";
import { TileCollection } from "../../studio1/common/tile/tileCollection.js";
import { Masonry } from "../../studio1/common/masonry/masonry.js";
import { IAppBase } from "../../common/appbase.js";
import { instantiate } from "../../common/component.js";



export class Studio extends DisposableStack {
    constructor(
        @IAppBase()
        appBase: IAppBase
    ) {
        super();
        const _appElement = appBase.element;

        this._layout = new Masonry(_appElement, {
            createContentRenderer(_options) {
                const _ctor = getContentRenderer(_options.rendererName);
                if (!_ctor) {
                    throw Error(`Content renderer ${_options.rendererName} does not exist`);
                }
                return new _ctor;
            },
            createTabRenderer(_options) {
                const _ctor = getTabRenderer(_options.rendererName);
                if (!_ctor) {
                    throw Error(`Tab renderer ${_options.rendererName} does not exist`);
                }
                return new _ctor;
            },
        }, this._tiles);

        for (const _opt of getComponents()) {
            this._layout.addTile(_opt);
        }
    }

    private _tiles  = new TileCollection;
    private _layout: Masonry;
}

instantiate(Studio);