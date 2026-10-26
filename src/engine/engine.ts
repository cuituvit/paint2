import { Component, registerSingleton } from "../common/component.js";
import { EngineDocumentEvent, IEngine } from "../common/components/engine.js";
import { DisposableStack } from "../common/disposable.js";
import { P2DocumentOptions, IP2Document, IPixelLayer, PixelLayerOptions } from "../common/document.js";
import { Emitter } from "../common/event.js";
import { IGpu, IGpuDevice } from "../common/gpu.js";
import { P2Document, PixelLayer } from "./common/document.js";



class Engine extends Component implements IEngine {
    private readonly _disposableStack  = new DisposableStack;

    private readonly _onDocumentCreate = this._disposableStack.use(new Emitter<EngineDocumentEvent>);
    readonly onDocumentCreate          = this._onDocumentCreate.event;
    
    private readonly _onActiveDocumentChanged = this._disposableStack.use(new Emitter<EngineDocumentEvent>({ replay: true }));
    readonly onActiveDocumentChanged          = this._onActiveDocumentChanged.event;

    constructor(
        @IGpu
        private readonly gpuDevice: IGpuDevice
    ) {
        super();

        this.setActiveDocument(this.createDocument({
            name: "testdoc",
            width: 644,
            height: 644,
        }));
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

    createDocument(_options: P2DocumentOptions): P2Document {
        const _newDoc = new P2Document(_options);
        this._documents.push(_newDoc);
        this._onDocumentCreate.invokeListeners({ document: _newDoc });
        return _newDoc;
    }

    setActiveDocument(_document: P2Document):     IP2Document;
    setActiveDocument(_index: number):            IP2Document | undefined;
    setActiveDocument(_undefined: undefined):     undefined;
    setActiveDocument(_arg: number | P2Document | undefined): IP2Document | undefined {
        let _document: P2Document | undefined = undefined;

        if (typeof _arg === "number") {
            _document = this._documents[_arg];

            if (_document) {
                this._activeDocumentIndex = _arg;
            }
        } else {
            if (_arg === undefined) {
                _document                 = undefined;
                this._activeDocumentIndex = -1;

                this._onActiveDocumentChanged.invokeListeners({ document: undefined });
                return undefined;
            } else {
                _document                 = _arg;
                this._activeDocumentIndex = this._documents.indexOf(_document);
            }
        }

        if (_document) {
            this._onActiveDocumentChanged.invokeListeners({ document: _document });
        }

        return _document;
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