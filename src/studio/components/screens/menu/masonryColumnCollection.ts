import { Component, createDecorator, registerTransient } from "../../../../common/component.js";
import { IMasonryTile } from "../../../common/masonry.js";



export interface _IMasonryColumn {
    placeTile(_tile: IMasonryTile): void;
    clear():                 void;
    readonly x:              number;
    readonly width:          number;
    readonly height:         number;
    readonly tiles:          IMasonryTile[];
}

export type _MasonryColumnOptions = {
    readonly initialX?:      number;
    readonly initialWidth?:  number;
};

export class _MasonryColumn implements _IMasonryColumn {
    constructor(_options?: _MasonryColumnOptions) {
        const _defaultOptions: _MasonryColumnOptions = {
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

    placeTile(_tile: IMasonryTile) {
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
    private _tiles:  IMasonryTile[] = [];
}

export interface _IMasonryColumnCollection {
    create(_options: _MasonryColumnOptions):                          _IMasonryColumn;
    findBest(_height: number, _visibleColumnCount: number):           _IMasonryColumn;
    distributeTile(_tile: IMasonryTile, _visibleColumnCount: number): void;
    readonly columns:                                                 _IMasonryColumn[];
}

export const _IMasonryColumnCollection = createDecorator<_IMasonryColumnCollection>("masonryColumnCollection");

class _MasonryColumnCollection extends Component implements _IMasonryColumnCollection {
    constructor() {
        super();
    }

    dispose() {
        
    }

    create(_options: _MasonryColumnOptions): _IMasonryColumn {
        const _newcol = new _MasonryColumn(_options);
        this._columns.push(_newcol);
        return _newcol;
    }

    findBest(_height: number, _visibleColumnCount: number) {
        let _bestColumn =
            this._columns[0] ??
            this.create({});

        let _bestHeight = Infinity;

        for (let _i=0; _i < _visibleColumnCount && _i < this._columns.length; ++_i) {
            const _col = this._columns[_i];

            const _candidate =
                _col.height + _height;
    
            if (_candidate < _bestHeight) {
                _bestHeight = _candidate;
                _bestColumn = _col;
            }
        }

        return _bestColumn;
    }

    distributeTile(_tile: IMasonryTile, _visibleColumnCount: number) {
        this.findBest(_tile.h, _visibleColumnCount).placeTile(_tile);
    }
    
    get columns() {
        return this._columns;
    }

    private _columns = [] as _IMasonryColumn[];
}

registerTransient(_IMasonryColumnCollection, _MasonryColumnCollection);