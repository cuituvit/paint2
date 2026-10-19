import { IContentRenderer, RendererInitParameters } from "../../../studio1/common/tile/tile.js";
import { registerComponent, registerContentRenderer } from "../common/registry.js";



class DocumentContentRenderer extends DisposableStack implements IContentRenderer {
    constructor() {
        super();

        this.element = document.createElement("div");
    }

    init(parameters: RendererInitParameters): void {

    }

    element: HTMLElement;
}

registerContentRenderer("documentRenderer", DocumentContentRenderer);
registerComponent("document", {
    id:                  "document",
    contentRendererName: "documentRenderer",
    tabRendererName:     "default",
    title:               "Document",
    initialW:             192,
    initialH:             256,
});