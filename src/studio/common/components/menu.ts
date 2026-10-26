import { createDecorator } from "../../../common/component.js";
import { Parameters } from "../../../common/utility.js";
import { IMasonryTile, MasonryAddTileOptions } from "../masonry.js";



export interface IMenuMasonry {
    addTile<_Ty extends object = Parameters>(_options: MasonryAddTileOptions): IMasonryTile;
    layout():  void;
    reorder(): void;
}

export interface IMenuElement {
    readonly element: HTMLElement;
}

export type IMenu  = IMenuMasonry & IMenuElement;
export const IMenu = createDecorator<IMenu>("menu");