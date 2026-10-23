import { Component, createDecorator, registerSingleton } from "./component.js";



export interface IGpuDevice {
    readonly device: GPUDevice;
}

export type IGpu  = IGpuDevice;
export const IGpu = createDecorator<IGpu>("gpu");

class Gpu extends Component implements IGpu {
    constructor() {
        super("ASYNC_INIT");

        (async ()=>{
            const _adapter = await navigator.gpu.requestAdapter();
            const _device  = await _adapter?.requestDevice();
            if (!_device) {
                throw Error("!_device");
            }
            
            this._device = _device;
            this.finishInit();
        })();
    }

    dispose() {
        
    }

    get device() {
        if (_DEV)
        if (!this._device) {
            throw Error("UNINITIALIZED DEVICE");
        }
        return this._device;
    }

    private _device!: GPUDevice;
}

registerSingleton(IGpu, Gpu);