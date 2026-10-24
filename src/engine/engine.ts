import { Component, registerSingleton } from "../common/component.js";
import { EngineDocumentCreateEvent, IEngine } from "../common/components/engine.js";
import { P2DocumentOptions, IP2Document, IPixelLayer, PixelLayerOptions } from "../common/document.js";
import { Emitter } from "../common/event.js";
import { IGpu, IGpuDevice } from "../common/gpu.js";
import { P2Document, PixelLayer } from "./common/document.js";



class Engine extends Component implements IEngine {
    private readonly _onDocumentCreate = new Emitter<EngineDocumentCreateEvent>;
    readonly onDocumentCreate          = this._onDocumentCreate.event;

    constructor(
        @IGpu
        private readonly gpuDevice: IGpuDevice
    ) {
        super();
    }

    dispose(): void {
        
    }

    createPixelLayer(_document: P2Document, _options: Omit<PixelLayerOptions, "device">): IPixelLayer {
        const _newPixelLayer = new PixelLayer({
            device: this.gpuDevice.device,
            ..._options,
        });

        _document.layers.push(_newPixelLayer);
        return _newPixelLayer;
    }

    createDocument(_options: P2DocumentOptions): IP2Document {
        const _newDoc = new P2Document(_options);
        this._documents.push(_newDoc);
        this._onDocumentCreate.invokeListeners({ document: _newDoc });
        return _newDoc;
    }

    get activeDocument(): IP2Document | undefined {
        return this._documents[this._activeDocumentIndex] ?? undefined;
    }

    get documents() {
        return this._documents;
    }

    private _documents           = [] as P2Document[]
    private _activeDocumentIndex = -1;
}

registerSingleton(IEngine, Engine);