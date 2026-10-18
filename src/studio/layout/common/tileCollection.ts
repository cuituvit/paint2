import { Tile } from "./tile.js";



export class TileCollection {
    insert(_key: string, _val: Tile) {
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

    reorder() {
        for (let _i=this._listOrdered.length-1; _i>0; --_i) {
            const _j = Math.floor(Math.random() * (_i + 1));

            [this._listOrdered[_i], this._listOrdered[_j]] =
            [this._listOrdered[_j], this._listOrdered[_i]];
        }
    }

    clear() {
        this._map.clear();
        this._listOrdered = [];
    }

    get listOrdered() {
        return this._listOrdered;
    }
    
    private _map         = new Map<string, Tile>();
    private _listOrdered = [] as Tile[];
}