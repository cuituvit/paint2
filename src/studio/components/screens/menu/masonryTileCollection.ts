import { Component, createDecorator, registerTransient } from "../../../../common/component.js"
import { IDisposable } from "../../../../common/disposable.js";
import { IMasonryTile } from "../../../common/masonry.js";



export type _IMasonryTileCollection = IDisposable & {
    insert(_key: string, _val: IMasonryTile): IMasonryTile | undefined;
    get(_key: string):                        IMasonryTile | undefined;
    erase(_key: string):                      IMasonryTile | undefined;
    reorder():                                void;
    clear():                                  void;
    readonly entries:                         [string, IMasonryTile][];
    readonly ordered:                         IMasonryTile[];
}

export const _IMasonryTileCollection = createDecorator<_IMasonryTileCollection>("masonryTileCollectionr");

class _MasonryTileCollection extends Component implements _IMasonryTileCollection {
    constructor() {
        super();
    }

    dispose() {
        this.clear();
    }

    insert(_key: string, _val: IMasonryTile) {
        if (this._map.has(_key)) {
            return this.erase(_key);
        }

        this._map.set(_key, _val);
        this._listOrdered.push(_val);
        return undefined;
    }

    get(_key: string) {
        return this._map.get(_key);
    }

    erase(_key: string) {
        const _tile = this.get(_key);
        if (_tile) {
            this._map.delete(_key);
            const _index = this._listOrdered.indexOf(_tile);
            this._listOrdered.splice(_index, 1);
        }
        return _tile;
    }

    reorder(): void {
        for (let _i=this._listOrdered.length-1; _i>0; --_i) {
            const _j = Math.floor(Math.random() * (_i + 1));

            [this._listOrdered[_i], this._listOrdered[_j]] =
            [this._listOrdered[_j], this._listOrdered[_i]];
        }
    }

    clear(): void {
        for (const _t of this._map) {
            _t[1].dispose();
        }

        this._map.clear();
        this._listOrdered = [];
    }

    get entries() {
        return this._map.entries().toArray();
    }

    get ordered() {
        return this._listOrdered;
    }

    private _map         = new Map<string, IMasonryTile>();
    private _listOrdered = [] as IMasonryTile[];
}

registerTransient(_IMasonryTileCollection, _MasonryTileCollection);