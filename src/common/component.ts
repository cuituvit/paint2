


export type InterfaceId = string;

export interface IUnknown extends Disposable {
    queryInterface<_Ty>(_iid: InterfaceId): _Ty;
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

    queryInterface<_Ty>(_iid: InterfaceId): _Ty {
        const _inst = this._interfaces.get(_iid);

        if (!_inst) {
            throw Error(`Component has no registered interface ${_iid}`);
        }

        return _inst as _Ty;
    }

    abstract [Symbol.dispose](): void;

    private readonly _interfaces = new Map<InterfaceId, unknown>();
    protected disposed?: true;
}

export interface ComponentId<_Ty> {
    (_target: Function, _key: string | undefined, _index: number): void;
    type: _Ty;
}

const _componentDependencies = new WeakMap<Function, Map<number, ComponentId<any>>>();
const _componentInstances    = new Map<ComponentId<any>, IUnknown>();

const _singletonComponents   = new Map<ComponentId<any>, new(..._args: any[])=>IUnknown>();

export function createDecorator<_Ty>(_name: string) {
    const _id = function(_target: Function, _key: string | undefined, _index: number) {
        if (!_componentDependencies.has(_target)) {
            _componentDependencies.set(_target, new Map);
        }

        _componentDependencies.get(_target)!.set(_index, _id);
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

function _instantiate<_Ty>(_ctor: new(..._args: any[])=>_Ty): _Ty {
    const _deps = _componentDependencies.get(_ctor);
    const _args = [];

    if (_deps) {
        for (const _v of _deps) {
            const _argIndex    = _v[0];
            const _compId      = _v[1];

            let _depInst = _componentInstances.get(_compId);
            if (!_depInst) {
                const _ctor = _singletonComponents.get(_compId);

                if (!_ctor) {
                    if (_DEV) {
                        console.warn(`Component dependency ${_compId} missing`);
                    }
                    continue;
                }

                _depInst = _instantiate(_ctor);
                _componentInstances.set(_compId, _depInst!);
            }

            _args[_argIndex] = _depInst;
        }
    }

    return new _ctor(..._args);
}

export function instantiateSingletons() {
    for (const _sc of _singletonComponents) {
        const _id   = _sc[0];
        const _ctor = _sc[1];

        if (!_componentInstances.has(_id)) {
            const _newInst = _instantiate(_ctor);
            _componentInstances.set(_id, _newInst);
        }
    }
}