import { createDecorator } from "../../../common/component.js";
import { IContentRenderer } from "../contentRenderer.js";



export interface IContentRendererRegistry {
    register(_name: string, _fn: ()=>IContentRenderer): void;
    remove(_name: string): boolean;
    create(_id: string): IContentRenderer;
}

export const IContentRendererRegistry = createDecorator<IContentRendererRegistry>("contentRendererRegistry");