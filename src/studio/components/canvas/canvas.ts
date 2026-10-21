import { IAppBase } from "../../../common/appbase.js";
import { Component, createDecorator, registerSingleton } from "../../../common/component.js";



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
    ) {
        super();

        this._element    = document.createElement("canvas");
        this._element.id = "the-canvas";
        this.appbase.element.prepend(this._element);

        const _resizeObs = new ResizeObserver(_e=>{
            for (const _entry of _e) {
                const { width, height } = _entry.contentRect;
                
                this._element.width     = width;
                this._element.height    = height;
            }
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

    get element() {
        return this._element;
    }

    private readonly _element: HTMLCanvasElement;
}

registerSingleton(ICanvas, Canvas);