


export type FreeFormOptions = {
    initialX?: number;
    initialY?: number;
    initialW?: number;
    initialH?: number;
};

export interface Freeform {
    x:                number;
    y:                number;
    w:                number;
    h:                number;
    readonly element: HTMLElement;
}

class _FreeformImpl implements Freeform {
    constructor(_target: HTMLElement, _options?: FreeFormOptions) {
        this._element = _target;

        let _x = 0;
        let _y = 0;
        let _w = 64;
        let _h = 64;

        if (_options) {
            _x = _options.initialX??_x;
            _y = _options.initialY??_y;
            _w = _options.initialW??_w;
            _h = _options.initialH??_h;
        }

        this._x = _x;
        this._y = _y;
        this._w = _w;
        this._h = _h;
        _target.style.position  = "absolute";
        _target.style.translate = `${_x}px ${_y}px`;
        _target.style.width     = `${_w}px`;
        _target.style.height    = `${_h}px`;
    }

    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get w() {
        return this._w;
    }
    get h() {
        return this._h;
    }

    private _translate(_val: {
        x?: number,
        y?: number,
    }) {
        this._element.style.translate 
        = `${_val.x??this._x}px ${_val.y??this._y}px`;        
    }
    
    set x(_val) {
        this._x = _val;
        this._translate({x: _val});
    }
    set y(_val) {
        this._y = _val;
        this._translate({y: _val});
    }

    private _size(_val: {
        w?: number,
        h?: number,
    }) {
        if (_val.w) {
            this._element.style.width = `${_val.w}px`;
        } if (_val.h) {
            this._element.style.height = `${_val.h}px`;
        }
    }

    set w(_val) {
        this._w = _val;
        this._size({w: _val});
    }
    set h(_val) {
        this._h = _val;
        this._size({h: _val});
    }

    get element() {
        return this._element;
    }

    private _x = 0;
    private _y = 0;
    private _w = 0;
    private _h = 0;
    private _element: HTMLElement;
}

interface _FreeformConstructor {
    new(_target: HTMLElement, _options?: FreeFormOptions): Freeform;
}

export const Freeform: _FreeformConstructor = _FreeformImpl;