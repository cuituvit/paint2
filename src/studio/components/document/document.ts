import { Component, createDecorator, registerSingleton } from "../../../common/component.js";
import { IEngine, IEngineDocumentRegistry, IEngineEvents } from "../../../common/components/engine.js";
import { DisposableStack } from "../../../common/disposable.js";
import { IContentRendererRegistry } from "../../common/components/contentRendererRegistry.js";
import { IMenu, IMenuMasonry } from "../../common/components/menu.js";
import { IContentRenderer, RendererInitParameters } from "../../common/contentRenderer.js";
import { IMasonryTile } from "../../common/masonry.js";



export interface IDocument {
    createContentRenderer(): IContentRenderer;
}

export const IDocument = createDecorator<IDocument>("document");

class Document extends Component implements IDocument {
    constructor(
        @IMenu
        private readonly menu: IMenuMasonry,
        @IContentRendererRegistry
        private readonly renderers: IContentRendererRegistry,
        @IEngine
        private readonly engine: IEngineDocumentRegistry & IEngineEvents,
    ) {
        super();

        this.renderers.register("document", ()=>{
            return this.createContentRenderer();
        });

        this.menu.addTile({
            tileId: "document",
            contentRendererId: "document",
            title: "Document",
        });
    }

    dispose() {

    }

    createContentRenderer() {
        return new class implements IContentRenderer {
            private readonly _disposableStack = new DisposableStack;

            constructor(private readonly _superthis: Document) {
                this.element = document.createElement("div");
            }

            dispose() {
                this._disposableStack.dispose();
            }

            init(parameters: RendererInitParameters): void {
                this.element.style.whiteSpace = "pre-line";

                if (parameters.params) {
                    const _p = parameters.params;

                    if (_p.tile) {
                        const _t = _p.tile as IMasonryTile;
                        _t.w = 128;
                        _t.h = 128;
                    }
                }

                const _engine = this._superthis.engine;
                this._disposableStack.use(_engine.onActiveDocumentChanged(_e=>{
                    const _doc = _e.document;

                    if (!_doc) {
                        this.element.textContent = `name:   
                        width:  
                        height: 
                        layers: 
                        `;
                    } else {
                        this.element.textContent = `name:   ${_doc.name}
                        width:  ${_doc.width}
                        height: ${_doc.height}
                        layers: ${_doc.layers.length}
                        `;
                    }
                }));
            }

            element: HTMLElement;
        }(this) as IContentRenderer;
    }
}

registerSingleton(IDocument, Document);