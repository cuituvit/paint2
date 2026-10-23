import shaderSource from "./canvasRenderer.wgsl";

import { Component, createDecorator, registerTransient } from "../../../common/component.js";
import { IGpu, IGpuDevice } from "../../../common/gpu.js";
import { IP2Document } from "../../../common/document/document.js";
import { mat4, vec2, vec4 } from "gl-matrix";



export interface ICanvasRendererParameters {
    pan(_delta: vec2):                                    void;
    setZoomTarget(_coord: vec2):                          void;
    zoom(_delta: number):                                 void;
    makeProjection(_canvasSize: vec2):                    mat4;
    makeClipRect(_canvasSize: vec2, _documentSize: vec2): vec4;
    translatePoint(_coord: vec2):                         void;
    center(_canvasSize: vec2, _documentSize: vec2):       void;
}

export interface ICanvasRendererRender {
    startEncoder():  void;
    finishEncoder(): void;
    renderEmpty(_canvasTextureView: GPUTextureView, _canvasSize: vec2, _documentSize: vec2):       void;
    renderDocument(_canvasTextureView: GPUTextureView, _canvasSize: vec2, _document: IP2Document): void;
}

export type ICanvasRenderer  =  ICanvasRendererParameters & ICanvasRendererRender;
export const ICanvasRenderer = createDecorator<ICanvasRenderer>("canvasRenderer");

class CanvasRenderer extends Component implements ICanvasRenderer {
    constructor(
        @IGpu
        private readonly gpuDevice: IGpuDevice,
    ) {
        super();

        const _device  = this.gpuDevice.device;
        const _targets = [{
            format: navigator.gpu.getPreferredCanvasFormat(),
            blend: {
                color: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                },
                alpha: {
                    srcFactor: "one",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                }
            },
        }] as GPUColorTargetState[];

        const _shader = _device.createShaderModule({code: shaderSource});

        const _makePipeline = (_entry: string) => _device.createRenderPipeline({
            layout:   "auto",
            vertex:   {module: _shader, entryPoint: "vmain"},
            fragment: {module: _shader, entryPoint: _entry, targets: _targets}
        });

        this._pipelines = {
            _main: _makePipeline("fmain"),
            _grid: _makePipeline("fmain_grid"),
        };

        this._sampler = _device.createSampler({
            magFilter: "nearest",
            minFilter: "nearest",
        });

        const _bufferUsage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

        this._uniformBuffers = {
            _main: _device.createBuffer({
                size:  64,
                usage: _bufferUsage,
            }),
            _grid: _device.createBuffer({
                size:  16,
                usage: _bufferUsage,
            }),
        };
    }

    dispose() {

    }

    startEncoder() {
        if (_DEV)
        if (this._commandEncoder) {
            throw Error("encoder started");
        }

        const _device        = this.gpuDevice.device;
        this._commandEncoder = _device.createCommandEncoder();
    }

    finishEncoder() {
        if (_DEV) {
            if (!this._commandEncoder) {
                throw Error("encoder not started");
            }
        }

        const _device = this.gpuDevice.device;
        _device.queue.submit([this._commandEncoder!.finish()]);
        this._commandEncoder = undefined;
    }

    private _renderSetup(_device: GPUDevice, _canvasTextureView: GPUTextureView, _canvasSize: vec2, _documentSize: vec2) {
        const _renderPassEncoder = this._commandEncoder!.beginRenderPass({
            colorAttachments: [{
                view:    _canvasTextureView,
                loadOp:  "clear",
                storeOp: "store",
            }],
        });

        const _clip = this.makeClipRect(_canvasSize, _documentSize);
        if (
            _clip[0] > _canvasSize[0] || 
            _clip[1] > _canvasSize[1] ||
            _clip[2] <= 0            ||
            _clip[3] <= 0
        ) {
            _renderPassEncoder.end();
            return;
        }

        _renderPassEncoder.setScissorRect(
            _clip[0],
            _clip[1],
            _clip[2],
            _clip[3]
        );

        const _proj              = this.makeProjection(_canvasSize);
        const _sharedUniformdata = new ArrayBuffer(this._uniformBuffers._main.size);
        const _sharedFloatView   = new Float32Array(_sharedUniformdata);
        _sharedFloatView.set(_proj as Float32Array);

        const _intScratch = new Int32Array(4);
        _device.queue.writeBuffer(this._uniformBuffers._main, 0, _sharedUniformdata);

        return {
            _intScratch,
            _renderPassEncoder,
        }
    }

    private _renderGrid(_device: GPUDevice, _documentSize: vec2, _intScratch: Int32Array, _renderPassEncoder: GPURenderPassEncoder) {
        _intScratch[0] = 0;
        _intScratch[1] = 0;
        _intScratch[2] = _documentSize[0];
        _intScratch[3] = _documentSize[1];
        _device.queue.writeBuffer(this._uniformBuffers._grid, 0, _intScratch);

        const _bindGroup = _device.createBindGroup({
            layout: this._pipelines._grid.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: this._uniformBuffers._main },
                { binding: 1, resource: this._uniformBuffers._grid },
            ],
        });

        _renderPassEncoder.setPipeline(this._pipelines._grid);
        _renderPassEncoder.setBindGroup(0, _bindGroup);
        _renderPassEncoder.draw(6);
    }

    renderEmpty(_canvasTextureView: GPUTextureView, _canvasSize: vec2, _documentSize: vec2) {
        if (_DEV) {
            if (!this._commandEncoder) {
                throw Error("encoder not started");
            }
        }

        const _device = this.gpuDevice.device;
        const _setup  = this._renderSetup(_device, _canvasTextureView, _canvasSize, _documentSize);
        if (!_setup) {
            return;
        }

        const { _intScratch, _renderPassEncoder } = _setup;
        this._renderGrid(_device, _documentSize, _intScratch, _renderPassEncoder);
        _renderPassEncoder.end();
    }

    renderDocument(_canvasTextureView: GPUTextureView, _canvasSize: vec2, _document: IP2Document) {
        if (_DEV) {
            if (!this._commandEncoder) {
                throw Error("encoder not started");
            }
        }

        const _device       = this.gpuDevice.device;
        const _documentSize = [_document.width, _document.height];
        const _setup        = this._renderSetup(_device, _canvasTextureView, _canvasSize, _documentSize);
        if (!_setup) {
            return;
        }

        const { _intScratch, _renderPassEncoder } = _setup;
        this._renderGrid(_device, _documentSize, _intScratch, _renderPassEncoder);

        const _uniformBuffer = _device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        _renderPassEncoder.setPipeline(this._pipelines._main);
        for (const _l of _document.layers) {
            _intScratch[0] = _l.x;
            _intScratch[1] = _l.y;
            _intScratch[2] = _l.width;
            _intScratch[3] = _l.height;
            _device.queue.writeBuffer(_uniformBuffer, 0, _intScratch);

            const _bindGroup = _device.createBindGroup({
                layout: this._pipelines._main.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this._uniformBuffers._main },
                    { binding: 1, resource: _uniformBuffer },
                    { binding: 2, resource: this._sampler },
                    { binding: 3, resource: _l.texture.createView() },
                ],
            });

            _renderPassEncoder.setBindGroup(0, _bindGroup);
            _renderPassEncoder.draw(6);
        }

        _renderPassEncoder.end();
    }

    pan(_delta: vec2) {
        this._pan[0] -= _delta[0] / this._zoom;
        this._pan[1] -= _delta[1] / this._zoom;
    }

    setZoomTarget(_coord: vec2) {
        this._zoomTarget[0] = _coord[0];
        this._zoomTarget[1] = _coord[1];
    }

    zoom(_delta: number) {
        const _bf: vec2 = [
            this._zoomTarget[0] / this._zoom,
            this._zoomTarget[1] / this._zoom,
        ];
        
        const _factor  = 1 + (_delta / 120) * .25;
        this._zoom    *= _factor;
        this._zoom     = Math.min(Math.max(this._zoom, .05), 100);
        
        const _af: vec2 = [
            this._zoomTarget[0] / this._zoom,
            this._zoomTarget[1] / this._zoom,
        ];
    
        this._pan[0] += _bf[0] - _af[0];
        this._pan[1] += _bf[1] - _af[1];
    }

    makeProjection(_canvasSize: vec2) {
        const _proj = mat4.create();
        mat4.ortho(
            _proj,
            0 + this._pan[0],
            _canvasSize[0] / this._zoom + this._pan[0],
            _canvasSize[1] / this._zoom + this._pan[1],
            0 + this._pan[1],
            -100,
            100
        );
        return _proj;
    }

    makeClipRect(_canvasSize: vec2, _documentSize: vec2): vec4 {
        const _clipX = -this._pan[0]     * this._zoom;
        const _clipY = -this._pan[1]     * this._zoom;
        const _clipW = _documentSize[0] * this._zoom;
        const _clipH = _documentSize[1] * this._zoom;

        const _clipX2 = Math.max(0, _clipX);
        const _clipY2 = Math.max(0, _clipY);
        const _clipW2 
            = Math.min(_canvasSize[0], _clipW + _clipX) - (_clipX < 0 ? 0 : _clipX);
        const _clipH2 
            = Math.min(_canvasSize[1], _clipH + _clipY) - (_clipY < 0 ? 0 : _clipY);

        return [
            _clipX2,
            _clipY2,
            _clipW2,
            _clipH2,
        ];
    }

    translatePoint(_coord: vec2) {
        _coord[0] = _coord[0] / this._zoom + this._pan[0];
        _coord[1] = _coord[1] / this._zoom + this._pan[1];
    }

    center(_canvasSize: vec2, _documentSize: vec2) {
        this._pan[0] = -(_canvasSize[0]/2 - _documentSize[0]/2);
        this._pan[1] = -(_canvasSize[1]/2 - _documentSize[1]/2);
    }

    private _pan: vec2        = [0, 0];
    private _zoom             = 1;
    private _zoomTarget: vec2 = [0,0];

    private _commandEncoder?: GPUCommandEncoder;

    private _pipelines: {
        _main: GPURenderPipeline,
        _grid: GPURenderPipeline,
    };
    private _uniformBuffers: {
        _main: GPUBuffer,
        _grid: GPUBuffer,
    };
    private _sampler: GPUSampler;
}

registerTransient(ICanvasRenderer, CanvasRenderer);