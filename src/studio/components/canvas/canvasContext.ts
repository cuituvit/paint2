import { Component, createDecorator, IComponent, registerTransient } from "../../../common/component.js";
import { IGpu, IGpuDevice } from "../../../common/gpu.js";



export interface ICanvasContext {
    init(_element: HTMLCanvasElement): void;
    readonly context: GPUCanvasContext;
}

export const ICanvasContext = createDecorator<ICanvasContext>("canvasContext");

class CanvasContext extends Component implements ICanvasContext {
    constructor(
        @IGpu
        private readonly gpuDevice: IGpuDevice,
    ) {
        super();
    }

    dispose() {
        
    }

    init(_element: HTMLCanvasElement) {
        const _context = _element.getContext("webgpu") ?? undefined;
        if (!_context) {
            throw Error("!_context");
        }

        this._context = _context;
        this._context.configure({
            device: this.gpuDevice.device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: "premultiplied"
        });
    }

    get context() {
        if (_DEV)
        if (!this._context) {
            throw Error("UNINITIALIZED CONTEXT");
        }
        return this._context!;
    }

    private _context!: GPUCanvasContext;
}

registerTransient(ICanvasContext, CanvasContext);