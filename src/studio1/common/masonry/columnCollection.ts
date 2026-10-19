import { Tile } from "../tile/tile.js";
import { Column, ColumnOptions } from "./column.js";



export interface ColumnCollection extends DisposableStack {
    _createColumn(_options: ColumnOptions):                 Column;
    _findBestColumn(_height: number, _visibleColumnCount: number): Column;
    _distributeTile(_tile: Tile, _visibleColumnCount: number):     void;
    readonly element: HTMLElement;
    readonly columns: Column[];
}

class _ColumnCollectionImpl extends DisposableStack implements ColumnCollection {
    constructor(_container: HTMLElement) {
        super();

        this._element = document.createElement("div");
        this._element.classList.add("masonry");
        _container.appendChild(this._element);
    }

    _createColumn(_options: ColumnOptions) {
        const _newcol = new Column(_options);
        this.columns.push(_newcol);
        return _newcol;
    }

    _findBestColumn(_height: number, _visibleColumnCount: number) {
        let _bestColumn =
            this.columns[0] ??
            this._createColumn({});

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

    _distributeTile(_tile: Tile, _visibleColumnCount: number) {
        this._findBestColumn(_tile.h, _visibleColumnCount).placeTile(_tile);
        this._element.appendChild(_tile.element);
    }

    get element() {
        return this._element;
    }

    get columns() {
        return this._columns;
    }

    private _element: HTMLElement;
    private _columns: Column[] = [];
}

interface _ColumnCollectionConstructor {
    new(_container: HTMLElement): ColumnCollection;
}

export const ColumnCollection: _ColumnCollectionConstructor = _ColumnCollectionImpl;