import "./masonry.css"

import { Parameters } from "../common/utility.js"
import { IContentRenderer, ITabRenderer, Tile, TileOptions } from "../common/tile.js";
import { TileCollection } from "../common/tileCollection.js";
import { ColumnCollection } from "./columnCollection.js";
import { Column } from "./column.js";



export interface Masonry extends Disposable {
    addTile<_Ty extends object = Parameters>(_options: AddTileOptions): Tile | undefined;
    layout():         void;
    reorder():        void;
    readonly tiles:   Tile[];

    // ColumnCollection
    readonly element: HTMLElement;
    readonly columns: Column[];
}

export type CreateRendererOptions = {
    id:           string;
    rendererName: string;
};

export type MasonryOptions = {
    createContentRenderer: (_options: CreateRendererOptions)=>IContentRenderer;
    createTabRenderer:     (_options: CreateRendererOptions)=>ITabRenderer;
    minColumnWidth?:       number;
    maxColumnWidth?:       number;
};

export type AddTileOptions = Omit<TileOptions, "ContentRenderer" | "TabRenderer"> & {
    id:                  string;
    contentRendererName: string;
    tabRendererName:     string;
};

export class _MasonryImpl extends ColumnCollection implements Masonry {
    private _externalCollection = false;
    private _tileCollection:      TileCollection;

    constructor(
        _container:       HTMLElement,
        _options:         MasonryOptions,
        _tileCollection?: TileCollection
    ) {
        super(_container);
        if (!_tileCollection) {
            this._tileCollection     = new TileCollection;
        } else {
            this._tileCollection     = _tileCollection;
            this._externalCollection = true;
        }

        _options.minColumnWidth=_options.minColumnWidth?? 128;
        _options.maxColumnWidth=_options.maxColumnWidth?? 384;
        this._options = _options;

        const _observer = new ResizeObserver(_e=>{
            this._performLayout(true);
        });
        this.adopt(_observer, _v=>_v.disconnect());
        _observer.observe(this.element);
    }

    [Symbol.dispose]() {
        if (this.disposed) {
            return;
        }

        if (!this._externalCollection) {
            for (const _t of this._tileCollection.listOrdered) {
                _t[Symbol.dispose]();
            }
        }

        super[Symbol.dispose]();
    }

    private _createTile(_options: AddTileOptions) {
        const _newTile = new Tile({
            ContentRenderer:
                this._options.createContentRenderer({id: _options.id, rendererName: _options.contentRendererName}),
            TabRenderer:
                this._options.createTabRenderer({id: _options.id, rendererName: _options.tabRendererName}),
            ..._options,
        });
        return _newTile;
    }
    
    private _addTile(_id: string, _tile: Tile) {
        this._tileCollection.insert(_id, _tile);
        this._distributeTile(_tile, this._visibleColumnCount);
    }

    addTile<_Ty extends object = Parameters>(_options: AddTileOptions) {
        if (this.disposed) {
            return;
        }

        const _newTile = this._createTile(_options);

        if (this.columns.length === 0) {
            this._createColumn({
                initialWidth: _options.initialW
            })
        }

        this._addTile(_options.id, _newTile);
        return _newTile as Tile;
    }

    private _performLayout(_returnWhenColumnCountUnchanged: boolean) {
        const _width = this.element.clientWidth;

        const _newVisibleColumnCount = (()=>{
            let _i = 0;
            let _w = 0;

            while (_w <= _width) {
                if (_i >= this.columns.length) {
                    break;
                }

                _w += this.columns[_i++].width;
                if (_i >= this.columns.length) {
                    break;
                }
            }

            let _space = _width - _w;
            
            if (this._options.minColumnWidth! < _space) {
                while (_space > 0) {
                    _i++;
                    _space -= this._options.minColumnWidth!;
                }
            } else {
                while (_space < 0) {
                    _i--;
                    _space += this._options.minColumnWidth!;
                }
            }

            return _i;
        })();
        
        
        if (_newVisibleColumnCount === this._visibleColumnCount) {
            if (_returnWhenColumnCountUnchanged) {
                return;
            }
        }

        if (this.columns.length < _newVisibleColumnCount) {
            const _oldLength = this.columns.length;
            const _increase =
                _newVisibleColumnCount -
                _oldLength;

            let _vacantWidth = _width;

            for (let _i = 0; _i < _oldLength; ++_i) {
                _vacantWidth -=
                    this.columns[_i].width;
            }

            const _newWidth = Math.min(
                Math.max(
                    _vacantWidth / _increase,
                    this._options.minColumnWidth!,
                ),
                this._options.maxColumnWidth!,
            );

            let _nextX =
                _width - _vacantWidth;

            for (let _i = 0; _i < _increase; ++_i) {
                this._createColumn({
                    initialX: _nextX,
                    initialWidth: _newWidth,
                });

                _nextX += _newWidth;
            }
        }

        for (const _column of this.columns) {
            _column.clear();
        }

        for (const _t of this._tileCollection.listOrdered) {
            this._distributeTile(_t, _newVisibleColumnCount);
        }

        this._visibleColumnCount =
            _newVisibleColumnCount;
    }

    layout() {
        this._performLayout(false);
    }

    reorder() {
        this._tileCollection.reorder();
    }

    get options() {
        return this._options;
    }

    get tiles() {
        return this._tileCollection.listOrdered;
    }

    private _visibleColumnCount = 0;
    private _options: MasonryOptions;
}

interface _MasonryConstructor {
    new(_container: HTMLElement, _options: MasonryOptions, _tileCollection?: TileCollection): Masonry;
}

export const Masonry: _MasonryConstructor = _MasonryImpl;