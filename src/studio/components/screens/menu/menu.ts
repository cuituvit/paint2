import "./menu.css"

import { Component, registerSingleton } from "../../../../common/component.js";
import { Parameters } from "../../../../common/utility.js";
import { IMasonryTile, MasonryAddTileOptions } from "../../../common/masonry.js";
import { _IMenuMasonry } from "./menuMasonry.js";
import { IMenu } from "../../../common/components/menu.js";
import { IAppBase, IAppBaseScreenStack } from "../../../common/components/appbase.js";



export class Menu extends Component implements IMenu {
    constructor(
        @IAppBase
        private readonly appbase: IAppBaseScreenStack,
        @_IMenuMasonry
        private readonly masonry: _IMenuMasonry
    ) {
        super();

        this._element    = document.createElement("div");
        this._element.id = "menu";

        this.appbase.pushScreenStack(this._element);
    }

    dispose() {
        
    }

    addTile<_Ty extends object = Parameters>(_options: MasonryAddTileOptions): IMasonryTile {
        const _newTile = this.masonry.addTile(_options);
        this._element.appendChild(_newTile.element);
        return _newTile;
    }

    layout(): void {
        this.masonry.layout(this._element.clientWidth);
    }
    
    reorder(): void {
        this.masonry.reorder();
    }

    get element() {
        return this._element;
    }

    private _element: HTMLElement;
}

registerSingleton(IMenu, Menu);