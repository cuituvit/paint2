import "./sortableList.css"

import { IDisposable } from "../../../common/disposable.js";
import { Draggable, DropTarget } from "../dom/drag.js";



export interface SortableListConstructOptions {
    list?:       HTMLElement[];
    className?:  string;
    id?:         string;
}

export interface SortableListOptions {
    horizontal?: boolean;
}

export class SortableList implements IDisposable {
    constructor(_options?: SortableListOptions & SortableListConstructOptions) {
        const _defaultOptions = {
            horizontal: true,
        } as typeof this._options;

        if (_options) {
            if (_options.list) {
                for (const _e of _options.list) {
                    this.push(_e);
                }
            }

            this._options = {
                ..._defaultOptions,
                ..._options,
            };
        } else {
            this._options = {
                ..._defaultOptions,
            };
        }

        this.element           = document.createElement("div");
        _options?.className?this.element.className=_options.className:undefined;
        this.element.classList.add("sortable-list");
        _options?.id?this.element.id=_options.id:undefined;

        if (_options?.horizontal) {
            this.element.style.gridAutoFlow = "column"
        } else {
            this.element.style.gridAutoFlow = "row"
        }
    }

    dispose() {
    }

    push(_element: HTMLElement) {
        if (this._map.has(_element)) {
            if (_DEV) {
                console.warn(`SortableList element ${_element} already exists`);
            }
            return;
        }

        const _newDragNDrop = {
            _draggable:  new Draggable(_element),
            _dropTarget: new DropTarget(_element),
        };

        _newDragNDrop._draggable.onStart(_e=>{
            this._dragged = _element;
        });

        const _whichSide = (_e: DragEvent)=>{
            const _length  = this._options.horizontal ? _element.clientWidth : _element.clientHeight;
            const _dropPos = this._options.horizontal ? _e.offsetX           : _e.offsetY;

            const _normalized = _dropPos / _length;

            if (_normalized > .5) {
                return this._options.horizontal ? "right" : "bottom";
            } else {
                return this._options.horizontal ? "left"  : "top";
            }
        };

        _newDragNDrop._dropTarget.onOver(_e=>{
            const _side = _whichSide(_e);

            if (this._options.horizontal) {
                if (_side === "right") {
                    _element.classList.remove(`drag-mod-left`);
                } else {
                    _element.classList.remove(`drag-mod-right`);
                }
            } else {
                if (_side === "bottom") {
                    _element.classList.remove(`drag-mod-top`);
                } else {
                    _element.classList.remove(`drag-mod-bottom`);
                }
            }

            _element.classList.add(`drag-mod-${_side}`);
        });
        
        _newDragNDrop._dropTarget.onLeave(_e=>{
            _element.classList.remove(`drag-mod-left`);
            _element.classList.remove(`drag-mod-right`);
            _element.classList.remove(`drag-mod-top`);
            _element.classList.remove(`drag-mod-bottom`);
        });

        _newDragNDrop._dropTarget.onDrop(_e=>{
            if (!this._dragged) {
                return;
            }

            if (this._dragged === _element) {
                return;
            }

            const _side         = _whichSide(_e);
            const _draggedIndex = this._list.indexOf(this._dragged);
            this._list.splice(_draggedIndex, 1);

            const _index = this._list.indexOf(_element);

            if (_side === "left" || _side === "top") {
                this._list.splice(_index, 0, this._dragged);
                _element.before(this._dragged);
            } else {
                this._list.splice(_index + 1, 0, this._dragged);
                _element.after(this._dragged);
            }

            this._dragged = undefined;
        });

        this._map.set(_element, _newDragNDrop);
        this._list.push(_element);
        this.element.appendChild(_element);
    }

    remove(_element: HTMLElement): void;
    remove(_index: number):        void;
    remove(_ei: HTMLElement | number) {
        let _elem = undefined as HTMLElement | undefined;

        if (typeof _ei === "number") {
            _elem = this._list[_ei];

            if (!_elem) {
                return;
            }

            this._list.splice(_ei, 1);
        } else {
            _elem        = _ei;
            const _index = this._list.indexOf(_elem);

            if (!_index) {
                return;
            }

            this._list.splice(_index, 1);
        }

        _elem.remove();
        const _pair = this._map.get(_elem);
        _pair!._draggable.dispose();
        _pair!._dropTarget.dispose();
        this._map.delete(_elem);
    }

    readonly element: HTMLElement;

    get list() {
        return this._list;
    }
    
    set list(_val) {
        this._list = _val;
    }
    
    private _dragged?: HTMLElement;

    private _list = [] as HTMLElement[];
    private _map = new Map<HTMLElement, {
        _draggable:  Draggable,
        _dropTarget: DropTarget,
    }>();

    private _options: SortableListOptions;
}