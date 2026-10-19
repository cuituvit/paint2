import { IAppBase } from "../../common/appbase.js";
import { Component, createDecorator, registerSingleton } from "../../common/component.js";
import { Tile } from "./tile/tile.js";
import { TileCollection } from "./tile/tileCollection.js";
import { Parameters } from "../../common/parameters.js";
import { AddTileOptions, Masonry } from "./masonry/masonry.js";



export type IAddTile = Pick<Masonry, "addTile">;

export interface ITileCollection {
    readonly tiles: [string, Tile][];
}

export type ILayout  = IAddTile & ITileCollection;
export const ILayout = createDecorator<ILayout>("layout");

class Layout extends Component implements ILayout {
    constructor(
        @IAppBase()
        private readonly appbase: IAppBase
    ) {
        super();

        this._masonry = new Masonry(this.appbase.element, {

        }, this._tiles);

        this.registerInterface("addTile", this as IAddTile);
        this.registerInterface("tileCollection", this as ITileCollection);
    }

    [Symbol.dispose]() {

    }

    addTile<_Ty extends object = Parameters>(_options: AddTileOptions): Tile | undefined {
        return this._masonry.addTile(_options);
    }

    get tiles() {
        return this._tiles.listPair;
    }

    private _tiles = new TileCollection;
    private _masonry: Masonry;
}

registerSingleton(ILayout, Layout);