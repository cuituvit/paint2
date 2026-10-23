import { IAppBase } from "../../../common/appbase.js";
import { Component, createDecorator, IComponent, registerSingleton } from "../../../common/component.js";
import { ICanvasContext } from "./canvasContext.js";
import { ICanvasRenderer, ICanvasRendererParameters, ICanvasRendererRender } from "./canvasRenderer.js";



interface ICanvasElement {
    readonly element: HTMLCanvasElement;
}

export type ICanvas  = ICanvasElement;
export const ICanvas = createDecorator<ICanvas>("canvas");

class Canvas extends Component implements ICanvas {
    private readonly _disposableStack = new DisposableStack;

    constructor(
        @IAppBase
        private readonly appbase: IAppBase,
        @ICanvasContext
        private readonly context: ICanvasContext,
        @ICanvasRenderer
        private readonly renderer: ICanvasRendererRender & ICanvasRendererParameters,
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

            this._renderEmpty();
        });

        _resizeObs.observe(this.appbase.element);
        this._disposableStack.defer(()=>{
            _resizeObs.disconnect();
        });
    }

    dispose() {
        if (this.disposed) {
            return;
        }

        this._disposableStack.dispose();
        this.disposed = true;
    }

    private _renderEmpty() {
        const _size = [480, 480];
        this.renderer.startEncoder();
        this.renderer.renderEmpty(this._canvasTextureView, this._canvasSize, _size);
        this.renderer.finishEncoder();
        this.renderer.center(this._canvasSize, _size);
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