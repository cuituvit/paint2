


export type InterfaceId = string;

export interface IUnknown {
    queryInterface<_Ty>(_iid: InterfaceId): _Ty | undefined;
    addRef():  number;
    release(): number;
}

export class Component implements IUnknown {
    protected constructor() {
        this._interfaces.set("unknown", this);
    }

    protected registerInterface(_iid: InterfaceId, _instance: unknown) {
        if (this._interfaces.has(_iid)) {
            throw Error(`Interface ID ${_iid} already exists`);
        }

        this._interfaces.set(_iid, _instance);
    }

    queryInterface<_Ty>(_iid: InterfaceId): _Ty | undefined {
        const _inst = this._interfaces.get(_iid);

        if (!_inst) {
            return undefined;
        }

        this.addRef();
        return _inst as _Ty;
    }

    addRef() {
        if (this._refCount < 1) {
            throw Error("Attempting to reference a released Component Object");
        }

        return ++this._refCount;
    }

    release() {
        if (this._refCount < 1) {
            throw new Error("Reference count underflow");
        }

        const _count = --this._refCount;
        if (_count === 0) {
            this.onFinalRelease?.();
            this._interfaces.clear();
        }

        return _count;
    }

    protected onFinalRelease?(): void;

    private _refCount            = 1;
    private readonly _interfaces = new Map<InterfaceId, unknown>();
}

export interface ComponentId<_Ty> {
    <_IId extends InterfaceId>(_iId?: _IId): (_target: Function, _key: string | undefined, _index: number)=>void;
    type: _Ty;
}

type _ComponentIdInterfaceId<_Ty, _IId extends InterfaceId> = [ComponentId<_Ty>, _IId];

const _componentDependencies = new WeakMap<Function, Map<number, _ComponentIdInterfaceId<any, any>>>();
const _componentInstances    = new Map<ComponentId<any>, IUnknown>();
const _componentConstructors = new Map<ComponentId<any>, new(..._args: any[])=>any>();

export function createDecorator<_Ty>(_name: string) {
    const _id = function<_IId extends InterfaceId>(_iId: _IId = "unknown" as _IId) {
        return function(_target: Function, _key: string | undefined, _index: number) {
            if (!_componentDependencies.has(_target)) {
                _componentDependencies.set(_target, new Map);
            }
    
            _componentDependencies.get(_target)!.set(_index, [_id, _iId]);
        }
    } as ComponentId<_Ty>;

    _id.toString = ()=>_name;
    return _id;
}

export function registerSingleton<_Ty, _CompTy extends IUnknown>(_id: ComponentId<_Ty>, _ctor: new(..._args: any[])=>_CompTy) {
    if (_componentConstructors.has(_id)) {
        return;
    }
    _componentConstructors.set(_id, _ctor);
}

export function instantiate<_Ty>(_ctor: new(..._args: any[])=>_Ty): _Ty {
    const _deps = _componentDependencies.get(_ctor);
    const _args = [];

    if (_deps) {
        for (const _v of _deps) {
            const _compId = _v[1][0];

            let _depInst = _componentInstances.get(_compId);
            if (!_depInst) {
                const _ctor = _componentConstructors.get(_compId);
                if (!_ctor) {
                    continue;
                }

                _depInst = instantiate(_ctor);
            }

            _args[_v[0]] = _depInst!.queryInterface(_v[1][1]);
        }
    }

    return new _ctor(..._args);
}