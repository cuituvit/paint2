


export type InterfaceId = string;

export interface IUnknown extends Disposable {
    queryInterface<_Ty>(_iid: InterfaceId): _Ty | undefined;
}

export abstract class Component implements IUnknown {
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

        return _inst as _Ty;
    }

    abstract [Symbol.dispose](): void;

    private _refCount            = 1;
    private readonly _interfaces = new Map<InterfaceId, unknown>();
}

export interface ComponentId<_Ty> {
    <_IId extends InterfaceId>(_iId?: _IId): (_target: Function, _key: string | undefined, _index: number)=>void;
    type: _Ty;
}

type _ComponentIdInterfaceId<_Ty, _IId extends InterfaceId> = [ComponentId<_Ty>, _IId];

const _componentDependencies = new WeakMap<Function, Map<number, _ComponentIdInterfaceId<any, any>>>();
const _singletonComponents   = new Map<ComponentId<any>, new(..._args: any[])=>any>();
const _transientComponents   = new Map<ComponentId<any>, new(..._args: any[])=>any>();
const _componentInstances    = new Map<ComponentId<any>, IUnknown>();

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
    if (_singletonComponents.has(_id)) {
        return;
    }
    _singletonComponents.set(_id, _ctor);
}

export function registerTransient<_Ty, _CompTy extends IUnknown>(_id: ComponentId<_Ty>, _ctor: new(..._args: any[])=>_CompTy) {
    if (_transientComponents.has(_id)) {
        return;
    }
    _transientComponents.set(_id, _ctor);
}

export function instantiate<_Ty>(_ctor: new(..._args: any[])=>_Ty): _Ty {
    const _deps = _componentDependencies.get(_ctor);
    const _args = [];

    if (_deps) {
        for (const _v of _deps) {
            const _argIndex    = _v[0];
            const _compId      = _v[1][0];
            const _interfaceId = _v[1][1];

            let _depInst = _componentInstances.get(_compId);
            if (!_depInst) {
                let _ctor      = _transientComponents.get(_compId);
                let _transient = true;

                if (!_ctor) {
                    _ctor      = _singletonComponents.get(_compId);
                    _transient = false;
                }

                if (!_ctor) {
                    if (_DEV) {
                        console.warn(`Component dependency ${_compId} missing`);
                    }
                    continue;
                }

                _depInst = instantiate(_ctor);
                if (!_transient) {
                    _componentInstances.set(_compId, _depInst!);
                }
            }

            _args[_argIndex] = _depInst!.queryInterface(_interfaceId);
        }
    }

    return new _ctor(..._args);
}