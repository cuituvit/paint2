


export interface IDisposable {
    dispose(): void;
}

export class DisposableStack implements IDisposable {
    dispose() {
        if (this._disposed) {
            return;
        }

        const _disposables = this._disposables;
        this._disposables  = [];
        const _errors      = [] as unknown[];

        for (let _i=_disposables.length-1; _i>=0; --_i) {
            try {
                _disposables[_i].dispose();
            } catch (_e) {
                _errors.push(_e);
            }
        }

        if (_errors.length === 1) {
            throw _errors[0];
        }

        if (_errors.length > 1) {
            throw AggregateError(_errors, `Resource disposal generated ${_errors.length} errors`);
        }

        this._disposed = true;
    }

    private _throwDisposed() {
        throw Error("Disposed DisposableStack");
    }

    private _throwIfDisposed() {
        if (this._disposed) {
            this._throwDisposed();
        }
    }

    use<_Ty extends IDisposable | null | undefined>(_val: _Ty): _Ty {
        if (_val === undefined || _val === null) {
            return _val;
        }

        if (this._disposed) {
            _val.dispose();
            this._throwDisposed();
        }

        this._disposables.push(_val);
        return _val;
    }

    adopt<_Ty>(_val: _Ty, _onDispose: (_val: _Ty)=>void): _Ty {
        if (this._disposed) {
            _onDispose(_val);
            this._throwDisposed();
        }

        this._disposables.push({
            dispose: ()=>_onDispose(_val),
        });

        return _val;
    }

    defer(_callback: ()=>void) {
        this._throwIfDisposed();
        this._disposables.push({ dispose: _callback });
    }

    move() {
        this._throwIfDisposed();

        const _stack        = new DisposableStack;
        _stack._disposables = this._disposables;
        this._disposables   = [];
        this._disposed      = true;

        return _stack;
    }

    get disposed() {
        return this._disposed;
    }

    private _disposables = [] as IDisposable[];
    private _disposed    = false;
}