import { Tile } from "../common/tile.js";



export interface Column extends Disposable {
    placeTile(_tile: Tile): void;
    clear():                 void;
    readonly x:              number;
    readonly width:          number;
    readonly height:         number;
    readonly tiles:          Tile[];
}

export type ColumnOptions = {
    readonly initialX?:      number;
    readonly initialWidth?:  number;
};

class _ColumnImpl extends DisposableStack implements Column {
    constructor(_options?: ColumnOptions) {
        super();

        const _defaultOptions: ColumnOptions = {
            initialX:     0,
            initialWidth: 256,
        } as const;

        _options = {
            ..._defaultOptions,
            ..._options,
        };

        this._x     = _options.initialX!;
        this._width = _options.initialWidth!;
    }

    placeTile(_tile: Tile) {
        this._tiles.push(_tile);

        _tile.w = this._width;
        _tile.x = this._x;
        _tile.y = this._height;

        this._height += _tile.h;
    }

    clear() {
        this._tiles  = [];
        this._height = 0;
    }

    get x() {
        return this._x;
    }

    get width() {
        return this._width;
    }

    set width(_val: number) {
        this._width = _val;
    }

    get height() {
        return this._height;
    }

    get tiles() {
        return this._tiles;
    }

    private _x:      number;
    private _width:  number;
    private _height: number = 0;
    private _tiles:  Tile[] = [];
}

interface _ColumnConstructor {
    new(_options?: ColumnOptions): Column;
}

export const Column: _ColumnConstructor = _ColumnImpl;