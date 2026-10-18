


export class Listener<_Ty extends HTMLElement, _Kty extends keyof HTMLElementEventMap> implements Disposable {
    constructor(
        readonly target:   _Ty,
        readonly type:     _Kty,
        readonly callback: (_ev: HTMLElementEventMap[_Kty])=>void,
        _options?:         AddEventListenerOptions,
    ) {
        this.target.addEventListener(type, callback, _options);
    }

    [Symbol.dispose]() {
        this.target.removeEventListener(this.type, this.callback);
    }
}