import "../components/components.js";

import {  getComponents, getContentRenderer, getTabRenderer } from "../components/common/registry.js";
import { TileCollection } from "../layout/common/tileCollection.js";
import { Masonry } from "../layout/masonry/masonry.js";



export interface Studio extends DisposableStack {

}

class _StudioImpl extends DisposableStack implements Studio {
    constructor(_appElement: HTMLElement) {
        super();

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

interface _StudioCtor {
    new(_appElement: HTMLElement): Studio;
}

export const Studio: _StudioCtor = _StudioImpl;