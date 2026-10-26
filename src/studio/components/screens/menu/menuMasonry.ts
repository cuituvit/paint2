import { Component, createDecorator, registerTransient } from "../../../../common/component.js"
import { Parameters } from "../../../../common/utility.js";
import { IContentRendererRegistry } from "../../../common/components/contentRendererRegistry.js";
import { IMasonryTile, MasonryAddTileOptions } from "../../../common/masonry.js";
import { _IMasonryColumn, _IMasonryColumnCollection } from "./masonryColumnCollection.js";
import { _MasonryTile } from "./masonryTile.js";
import { _IMasonryTileCollection } from "./masonryTileCollection.js";



export type _IMenuMasonry = {
    addTile<_Ty extends object = Parameters>(_options: MasonryAddTileOptions): IMasonryTile;
    layout(_width: number): void;
    reorder():              void;
    minColumnWidth:         number;
    maxColumnWidth:         number;
    readonly tiles:         IMasonryTile[];
    readonly columns:       _IMasonryColumn[];
}

export const _IMenuMasonry = createDecorator<_IMenuMasonry>("menuMasonry");

class _MenuMasonry extends Component implements _IMenuMasonry {
    constructor(
        @_IMasonryTileCollection
        private readonly tileCollection: _IMasonryTileCollection,
        @_IMasonryColumnCollection
        private readonly columnCollection: _IMasonryColumnCollection,
        @IContentRendererRegistry
        private readonly contentRenderers: IContentRendererRegistry,
    ) {
        super();
    }

    dispose() {
        this.tileCollection.dispose();
    }

    private _createTile(_options: MasonryAddTileOptions) {
        const _newTile = new _MasonryTile({
            contentRenderer: this.contentRenderers.create(_options.contentRendererId),
            ..._options,
        });

        _newTile.init({
            ..._options
        });

        return _newTile;
    }

    private _addTile(_id: string, _tile: IMasonryTile) {
        this.tileCollection.insert(_id, _tile);
        this.columnCollection.distributeTile(_tile, this._visibleColumnCount);
    }

    addTile<_Ty extends object = Parameters>(_options: MasonryAddTileOptions): IMasonryTile {
        const _newTile = this._createTile(_options);

        if (this.columnCollection.columns.length === 0) {
            this.columnCollection.create({
                initialWidth: 256
            });
        }

        this._addTile(_options.tileId, _newTile);
        return _newTile;
    }

    private _performLayout(_width: number, _returnWhenColumnCountUnchanged: boolean) {
        const _columns = this.columnCollection.columns;

        const _newVisibleColumnCount = (()=>{
            let _i         = 0;
            let _w         = 0;

            while (_w <= _width) {
                if (_i >= _columns.length) {
                    break;
                }

                _w += _columns[_i++].width;
                if (_i >= _columns.length) {
                    break;
                }
            }

            let _space = _width - _w;
            
            if (this._minColumnWidth! < _space) {
                while (_space > 0) {
                    _i++;
                    _space -= this._minColumnWidth!;
                }
            } else {
                while (_space < 0) {
                    _i--;
                    _space += this._minColumnWidth!;
                }
            }

            return _i;
        })();
        
        
        if (_newVisibleColumnCount === this._visibleColumnCount) {
            if (_returnWhenColumnCountUnchanged) {
                return;
            }
        }

        if (_columns.length < _newVisibleColumnCount) {
            const _oldLength = _columns.length;
            const _increase =
                _newVisibleColumnCount -
                _oldLength;

            let _vacantWidth = _width;

            for (let _i = 0; _i < _oldLength; ++_i) {
                _vacantWidth -=
                    _columns[_i].width;
            }

            const _newWidth = Math.min(
                Math.max(
                    _vacantWidth / _increase,
                    this._minColumnWidth!,
                ),
                this._maxColumnWidth!,
            );

            let _nextX =
                _width - _vacantWidth;

            for (let _i = 0; _i < _increase; ++_i) {
                this.columnCollection.create({
                    initialX: _nextX,
                    initialWidth: _newWidth,
                });

                _nextX += _newWidth;
            }
        }

        for (const _column of _columns) {
            _column.clear();
        }

        for (const _t of this.tileCollection.ordered) {
            this.columnCollection.distributeTile(_t, _newVisibleColumnCount);
        }

        this._visibleColumnCount =
            _newVisibleColumnCount;
    }

    layout(_width: number) {
        this._performLayout(_width, false);
    }

    reorder() {
        this.tileCollection.reorder();
    }

    get minColumnWidth() {
        return this._minColumnWidth;
    }
    
    set minColumnWidth(_val) {
        this._minColumnWidth = _val;
    }
    
    get maxColumnWidth() {
        return this._maxColumnWidth;
    }
    
    set maxColumnWidth(_val) {
        this._maxColumnWidth = _val;
    }

    get tiles() {
        return this.tileCollection.ordered;
    }

    get columns() {
        return this.columnCollection.columns;
    }

    private _minColumnWidth     = 256;
    private _maxColumnWidth     = 512;
    private _visibleColumnCount = 0;
}

registerTransient(_IMenuMasonry, _MenuMasonry);