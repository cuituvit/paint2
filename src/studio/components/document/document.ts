import { Component, createDecorator, registerSingleton } from "../../../common/component.js";
import { IEngine, IEngineDocumentRegistry } from "../../../common/components/engine.js";
import { IContentRenderer, RendererInitParameters } from "../../common/tile/tile.js";
import { IUiRenderers, IUiTiles, IUi } from "../../common/ui.js";



export interface IDocument {
    createContentRenderer(): IContentRenderer;
}

export const IDocument = createDecorator<IDocument>("document");

class Document extends Component implements IDocument {
    constructor(
        @IUi
        private readonly ui: IUiRenderers & IUiTiles,
        @IEngine
        private readonly documents: IEngineDocumentRegistry,
    ) {
        super();

        ui.registerContentRenderer("document", ()=>{
            return this.createContentRenderer();
        });

        ui.addTile({
            id: "document",
            contentRendererName: "document",
            title: "Document",
        });
    }

    dispose() {

    }

    createContentRenderer() {
        return new class implements IContentRenderer {
            constructor(private readonly _superthis: Document) {
                this.element = document.createElement("div");
            }

            dispose() {

            }

            init(parameters: RendererInitParameters): void {
                
            }

            element: HTMLElement;
        }(this) as IContentRenderer;
    }
}

registerSingleton(IDocument, Document);