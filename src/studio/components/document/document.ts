import { Component, createDecorator, IComponent, registerSingleton } from "../../../common/component.js";
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
            constructor() {
                this.element = document.createElement("div");
            }

            [Symbol.dispose]() {

            }

            init(parameters: RendererInitParameters): void {
            }

            element: HTMLElement;
        } as IContentRenderer;
    }
}

registerSingleton(IDocument, Document);