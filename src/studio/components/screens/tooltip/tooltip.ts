import "./tooltip.css";

import { Component, registerSingleton } from "../../../../common/component.js";
import { IAppBase, IAppBaseScreenStack } from "../../../common/components/appbase.js";
import { ITooltip } from "../../../common/components/tooltip.js";
import { DisposableStack, IDisposable } from "../../../../common/disposable.js";
import { FloatingSurface } from "../../../common/browser/floatingSurface.js";
import { IRenderer, RendererInitParameters } from "../../../common/browser/renderer.js";
import { IContentRendererRegistry } from "../../../common/components/contentRendererRegistry.js";
import { Emitter } from "../../../../common/event.js";



class _Tooltip extends Component implements ITooltip {
    private readonly _disposableStack = new DisposableStack;

    private _onTextChange = new Emitter<{ text: string, sub: string }>();
    readonly onTextChange = this._onTextChange.event;

    private static _followCursor(_element: HTMLElement) {
        const _listener = (_e: PointerEvent)=>{
            if (_element.parentElement) {
                _element.style.left = `${_e.clientX + 12}px`;
                _element.style.top  = `${_e.clientY + 12}px`;
            }
        };

        document.addEventListener("pointermove", _listener);

        return {
            dispose() {
                document.removeEventListener("pointermove", _listener);
            }
        } as IDisposable;
    }
    
    constructor(
        @IAppBase
        private readonly screenStack: IAppBaseScreenStack,
        @IContentRendererRegistry
        renderers: IContentRendererRegistry,
    ) {
        super();

        this._element    = document.createElement("div");
        this._element.id = "tooltip-shell";
        
        renderers.register("tooltip", this.render);
        
        this._floatingSurface = new FloatingSurface({
            id:       "tooltip-container",
            renderer: this.render(),
        });

        this._disposableStack.use(_Tooltip._followCursor(this._floatingSurface.element));
        this.screenStack.pushScreen(this._element);
    }

    dispose() {
        this._disposableStack.dispose();
    }

    readonly render = ()=>new class implements IRenderer {
        private readonly _disposableStack = new DisposableStack;

        constructor(private readonly _Tt: _Tooltip) {
            this.element    = document.createElement("div");
            this.element.id = "tooltip";

            this._textElem = document.createElement("span");
            this._subElem  = document.createElement("span");
            this._subElem.style.filter = "brightness(.5)";

            this.element.append(this._textElem, document.createElement("br"), this._subElem);

            this._disposableStack.use(this._Tt.onTextChange(_v=>{
                this._textElem.textContent = _v.text;
                this._subElem.textContent  = _v.sub;
            }));
        }

        dispose() {
            this._disposableStack.dispose();
        }

        init(parameters: RendererInitParameters) {
            
        }

        private readonly _textElem: HTMLElement;
        private readonly _subElem:  HTMLElement;
        readonly element: HTMLElement;
    }(this) as IRenderer;

    private _setText(_text: string, _sub: string) {
        this._text = _text;
        this._sub  = _sub;

        if (_text !== "") {
            this._element.appendChild(this._floatingSurface.element);
        } else {
            this._element.removeChild(this._floatingSurface.element);
        }

        this._onTextChange.invokeListeners({
            text: this._text,
            sub:  this._sub,
        })
    }

    addTooltip(_element: HTMLElement, _text: string, _sub: string = ""): IDisposable {
        const _pointerEnter = (_e: PointerEvent)=>{
            this._setText(_text, _sub);
        };
        
        const _pointerLeave = (_e: PointerEvent)=>{
            this._setText("", "");
        };

        _element.addEventListener("pointerenter", _pointerEnter);
        _element.addEventListener("pointerleave", _pointerLeave);

        return {
            dispose() {
                _element.removeEventListener("pointerenter", _pointerEnter);
                _element.removeEventListener("pointerleave", _pointerLeave);
            },
        }
    }

    get element() {
        return this._element;
    }

    private _text: string = "";
    private _sub:  string = "";

    private _floatingSurface: FloatingSurface
    private _element:         HTMLElement;
}

registerSingleton(ITooltip, _Tooltip);