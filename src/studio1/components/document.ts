import { Component, createDecorator, instantiate } from "../../common/component.js";
import { IAddTile, ILayout, ITileCollection } from "../common/layout.js";



export interface IDocument {

}

export const IDocument = createDecorator<IDocument>("document");

class Document extends Component implements IDocument {
    constructor(
        @ILayout("addTile")
        private readonly addTile: IAddTile
    ) {
        super();
    }

    [Symbol.dispose]() {

    }
}

instantiate(Document);