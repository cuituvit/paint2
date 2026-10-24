import { IAppBase } from "../../../common/appbase.js";
import { Component, createDecorator, registerSingleton } from "../../../common/component.js";
import { IEngine, IEngineDocumentRegistry } from "../../../common/components/engine.js";
import { DisposableStack } from "../../../common/disposable.js";
import { Emitter, Event, HTMLElementEventListener } from "../../../common/event.js";
import { ICanvasContext } from "./canvasContext.js";
import { ICanvasRenderer, ICanvasRendererParameters, ICanvasRendererRender } from "./canvasRenderer.js";



export interface CanvasPointerEvent extends PointerEvent {
    phase: "down" | "move" | "up";
}

export interface ICanvasEvents {
    readonly onPointer: Event<CanvasPointerEvent>;
}

export interface ICanvasElement {
    readonly element: HTMLCanvasElement;
}

export type ICanvas  = ICanvasEvents & ICanvasElement;
export const ICanvas = createDecorator<ICanvas>("canvas");

const _CANVASEMPTYDOCUMENTSIZE = [644, 644] as const;

class Canvas extends Component implements ICanvas {
    private readonly _disposableStack = new DisposableStack;

    private readonly _onPointer = this._disposableStack.use(new Emitter<CanvasPointerEvent>);
    readonly onPointer          = this._onPointer.event;

    private _registerPointerEvents() {
        const _baseCb = (_phase: CanvasPointerEvent["phase"])=>(_e: PointerEvent)=>{
            this._onPointer.invokeListeners({
                phase: _phase,
                ..._e,
            });
        };
        this._disposableStack.use(new HTMLElementEventListener(this._element, "pointerdown", _baseCb("down")));
        this._disposableStack.use(new HTMLElementEventListener(this._element, "pointermove", _baseCb("move")));
        this._disposableStack.use(new HTMLElementEventListener(this._element, "pointerup",   _baseCb("up")));
    }

    private _registerEvents() {
        this._registerPointerEvents();
    }

    constructor(
        @IAppBase
        private readonly appbase: IAppBase,
        @ICanvasContext
        private readonly context: ICanvasContext,
        @ICanvasRenderer
        private readonly renderer: ICanvasRendererRender & ICanvasRendererParameters,
        @IEngine
        private readonly engine: IEngineDocumentRegistry,
    ) {
        super();

        this._element    = document.createElement("canvas");
        this._element.id = "the-canvas";

        this.context.init(this._element);
        this.appbase.element.prepend(this._element);

        const _resizeObs = new ResizeObserver(_e=>{
            for (const _entry of _e) {
                const { width, height } = _entry.contentRect;
                
                this._element.width     = width;
                this._element.height    = height;
            }

            this._render();
        });

        _resizeObs.observe(this.appbase.element);
        this._disposableStack.defer(()=>{
            _resizeObs.disconnect();
        });

        this._registerEvents();
    }

    dispose() {
        if (this.disposed) {
            return;
        }

        this._disposableStack.dispose();
        this.disposed = true;
    }

    private _render() {
        this.renderer.startEncoder();

        const _activeDocument = this.engine.activeDocument;
        if (_activeDocument) {
            this.renderer.renderDocument(this._canvasTextureView, this._canvasSize, _activeDocument);
        } else {
            this.renderer.center(this._canvasSize, _CANVASEMPTYDOCUMENTSIZE);
            this.renderer.renderEmpty(this._canvasTextureView, this._canvasSize, _CANVASEMPTYDOCUMENTSIZE);
        }

        this.renderer.finishEncoder();
    }

    get element() {
        return this._element;
    }

    private get _canvasSize() {
        return [this._element.width, this._element.height];
    }

    private get _canvasTextureView() {
        return this.context.context.getCurrentTexture().createView();
    }

    private readonly _element: HTMLCanvasElement;
}

registerSingleton(ICanvas, Canvas);