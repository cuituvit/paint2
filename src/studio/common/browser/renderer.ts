import { IDisposable } from "../../../common/disposable.js";
import { Parameters } from "../../../common/utility.js";



export type RendererInitParameters = {
    params?: Parameters;
}

export interface IRenderer extends IDisposable {
    init(parameters: RendererInitParameters): void;
    readonly element: HTMLElement;
}