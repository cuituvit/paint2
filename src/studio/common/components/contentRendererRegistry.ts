import { createDecorator } from "../../../common/component.js";
import { IRenderer } from "../browser/renderer.js";



export interface IContentRendererRegistry {
    register(_name: string, _fn: ()=>IRenderer): void;
    remove(_name: string): boolean;
    create(_id: string): IRenderer;
}

export const IContentRendererRegistry = createDecorator<IContentRendererRegistry>("contentRendererRegistry");