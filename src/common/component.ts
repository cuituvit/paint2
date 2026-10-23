import { Latch } from "./latch.js";



export type InterfaceId = string;

export interface IComponent extends Disposable {
    readonly initialized: boolean;
    wait():               Promise<void>;
    dispose():            void;
}

export abstract class Component implements IComponent {
    protected constructor(_asyncInit?: "ASYNC_INIT") { // easier to see
        if (_asyncInit === "ASYNC_INIT") {
            this._initLatch = new Latch(1);
        }
    }

    abstract dispose(): void;

    [Symbol.dispose]() {
        this.dispose();
    }

    protected finishInit() {
        this._initLatch?.countDown();
        if (_DEV)
        if (!this.initialized) {
            throw Error("state error");
        }
    }

    async wait() {
        await this._initLatch?.wait();
    }

    get initialized() {
        return this._initLatch?.tryWait() ?? true;
    }

    private readonly _interfaces = new Map<InterfaceId, unknown>();
    private _initLatch?: Latch;
    protected disposed?: true;
}

export interface ComponentId<_Ty> {
    (_target: Function, _key: string | undefined, _index: number): void;
    type: _Ty;
}

const _componentDependencies = new WeakMap<Function, Map<number, ComponentId<any>>>();
const _componentInstances    = new Map<ComponentId<any>, IComponent>(); // singleton

const _singletonComponents   = new Map<ComponentId<any>, new(..._args: any[])=>IComponent>();
const _transientComponents   = new Map<ComponentId<any>, new(..._args: any[])=>IComponent>();

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

export function registerSingleton<_Ty, _CompTy extends IComponent>(_id: ComponentId<_Ty>, _ctor: new(..._args: any[])=>_CompTy) {
    if (_DEV) {
        if (_transientComponents.has(_id)) {
            throw Error(`Component ${_id.toString()} already registered as a singleton`);
        }
        if (_singletonComponents.has(_id)) {
            throw Error(`Singleton component ${_id.toString()} already exists`);
        }
    }
    _singletonComponents.set(_id, _ctor);
}

export function registerTransient<_Ty, _CompTy extends IComponent>(_id: ComponentId<_Ty>, _ctor: new(..._args: any[])=>_CompTy) {
    if (_DEV) {
        if (_singletonComponents.has(_id)) {
            throw Error(`Component ${_id.toString()} already registered as a singleton`);
        }
        if (_transientComponents.has(_id)) {
            throw Error(`Transient component ${_id.toString()} already exists`);
        }
    }
    _transientComponents.set(_id, _ctor);
}

async function _instantiate<_Ty extends IComponent>(_ctor: new(..._args: any[])=>_Ty): Promise<_Ty> {
    const _deps = _componentDependencies.get(_ctor);
    const _args = [];

    if (_deps) {
        for (const _v of _deps) {
            const _argIndex    = _v[0];
            const _compId      = _v[1];

            let _depInst = _componentInstances.get(_compId);
            if (!_depInst) {
                let _ctor   = _transientComponents.get(_compId);
                if (!_ctor) {
                    _ctor = _singletonComponents.get(_compId);
                }

                if (!_ctor) {
                    if (_DEV) {
                        console.warn(`Component dependency ${_compId} missing`);
                    }
                    continue;
                }

                _depInst = await _instantiate(_ctor);
                _componentInstances.set(_compId, _depInst!);
            }

            _args[_argIndex] = _depInst;
        }
    }

    const _newInst = new _ctor(..._args);
    await _newInst.wait();
    return _newInst;
}

export async function instantiateSingletons() {
    for (const _sc of _singletonComponents) {
        const _id   = _sc[0];
        const _ctor = _sc[1];

        if (!_componentInstances.has(_id)) {
            const _newInst = await _instantiate(_ctor);
            _componentInstances.set(_id, _newInst);
        }
    }
}