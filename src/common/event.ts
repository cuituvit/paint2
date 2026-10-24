import { IDisposable } from "./disposable.js";



export class HTMLElementEventListener<_Ty extends HTMLElement, _Kty extends keyof HTMLElementEventMap> implements IDisposable {
    constructor(
        readonly target:   _Ty,
        readonly type:     _Kty,
        readonly callback: (_ev: HTMLElementEventMap[_Kty])=>void,
        _options?:         AddEventListenerOptions,
    ) {
        this.target.addEventListener(type, callback, _options);
    }

    dispose() {
        this.target.removeEventListener(this.type, this.callback);
    }
}

export interface Event<_Ty> {
    (_listener: (_e: _Ty)=>any): IDisposable;
}

export class Emitter<_Ty> implements IDisposable {
    dispose() {
        if (this._disposed) {
            return;
        }

        this._disposed = true;
        this._listeners.clear();
    }
    
    readonly event: Event<_Ty> = (_listener)=>{
        if (this._disposed) {
            throw Error("Disposed Emitter");
        }

        this._listeners.add(_listener);
        let _subbed = true;

        return {
            dispose: ()=>{
                if (!_subbed) {
                    return;
                }

                _subbed = false;
                this._listeners.delete(_listener);
            },
        }
    };

    invokeListeners(_event: _Ty) {
        if (this._disposed) {
            return;
        }

        for (const _l of [...this._listeners]) {
            _l(_event);
        }
    }

    private _listeners = new Set<(_event: _Ty)=>void>();
    private _disposed  = false;
}