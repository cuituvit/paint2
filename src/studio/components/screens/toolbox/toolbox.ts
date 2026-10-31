import "./toolbox.css"

import { Component, registerSingleton } from "../../../../common/component.js";
import { IAppBase, IAppBaseScreenStack } from "../../../common/components/appbase.js";
import { IToolbox, ToolboxAddToolOptions } from "../../../common/components/toolbox.js";
import { IRenderer, RendererInitParameters } from "../../../common/browser/renderer.js";
import { IContentRendererRegistry } from "../../../common/components/contentRendererRegistry.js";
import { FloatingSurface } from "../../../common/browser/floatingSurface.js";
import { ITool } from "../../../common/tool.js";
import { SortableList } from "../../../common/browser/sortableList.js";
import { ITooltip, ITooltipTooltip } from "../../../common/components/tooltip.js";
import { DisposableStack, IDisposable } from "../../../../common/disposable.js";
import { ICanvas, ICanvasEvents } from "../../../common/components/canvas.js";
import { HTMLElementEventListener } from "../../../../common/event.js";



interface _Tool {
    _name:    string;
    _tool:    ITool;
    _element: HTMLElement;
}

class _Toolbox extends Component implements IToolbox {
    private readonly _disposableStack = new DisposableStack;

    constructor(
        @IAppBase
        private readonly screenStack: IAppBaseScreenStack,
        @IContentRendererRegistry
        renderers: IContentRendererRegistry,
        @ITooltip
        private readonly tooltip: ITooltipTooltip,
        @ICanvas
        canvasEvents: ICanvasEvents,
    ) {
        super();

        this._sortableList = new SortableList({
            id:         "toolbox",
            horizontal: true,
        });

        this._surface     = new FloatingSurface({
            renderer: this.render(),
            id:       "toolbox-container",
        });
        
        renderers.register("toolbox", this.render);
        this.screenStack.pushScreen(this.element);

        this._disposableStack.use(canvasEvents.onPointer(_e=>{
            if (!this._activePointerToolId) {
                return;
            }

            const _activePointerTool = this._pointerTools.get(this._activePointerToolId);
            if (!_activePointerTool) {
                return;
            }

            _activePointerTool.onPointer!(_e);
        }));
    }

    dispose() {
        this._disposableStack.dispose();
    }

    private _renderTool(_name: string) {
        const _el     = document.createElement("div");
        _el.className = "tool";
        return _el;
    }

    addTool(_options: ToolboxAddToolOptions) {
        if (this._tools.has(_options.id)) {
            throw Error(`Tool with id ${_options.id} already exists`);
        }

        const _id   = _options.id;
        const _name = _options.name;
        const _tool = _options.tool;

        const _newEl = this._renderTool(_name);

        this._tools.set(_id, {
            _name:    _name,
            _tool:    _tool,
            _element: _newEl,
        });

        if (_tool.onActivate) {
            this._activateTools.set(_id, _tool);
        }

        const _clickListener = ()=>{
            if (this._activateTools.has(_id)) {
                this._activateTools.get(_id)!.onActivate!();
            }

            if (this._pointerTools.has(_id)) {
                if (this._activePointerToolId) {
                    const _tmeta = this._tools.get(this._activePointerToolId);
                    if (_DEV)
                    if (!_tmeta) {
                        throw Error("state error");
                    }

                    _tmeta!._element.classList.remove("tool-active");
                }

                this._activePointerToolId = _id;
                const _tmeta            = this._tools.get(_id);
                _tmeta!._element.classList.add("tool-active");
            }
        }
        
        if (_tool.onPointer) {
            this._pointerTools.set(_id, _tool);

            if (!this._activePointerToolId) {
                this._activePointerToolId = _id;
                _clickListener();
            }
        }

        this._sortableList.push(_newEl);
        this._disposableStack.use(this.tooltip.addTooltip(_newEl, _name, crypto.randomUUID()));
        this._disposableStack.use(new HTMLElementEventListener(_newEl, "click", _clickListener));

        return {
            dispose: ()=>{
                this._tools.delete(_id);
                this._activateTools.delete(_id);
                this._pointerTools.delete(_id);
            },
        } as IDisposable;
    }

    get toolIds() {
        return this._tools.keys().toArray();
    }

    readonly render = ()=>new class implements IRenderer {
        constructor(private readonly _tb: _Toolbox) {}
        dispose() {}

        init(parameters: RendererInitParameters) {}

        get element() {
            return this._tb._sortableList.element;
        }
    }(this) as IRenderer;
    
    get element() {
        return this._surface.element;
    }

    private _tools         = new Map<string, _Tool>();
    private _activateTools = new Map<string, ITool>();
    private _pointerTools  = new Map<string, ITool>();
    private _activePointerToolId?: string;

    private _sortableList: SortableList;
    private _surface:      FloatingSurface;
}

registerSingleton(IToolbox, _Toolbox);