import { IDisposable } from "../../common/disposable.js";
import { Parameters } from "../../common/utility.js";



export type RendererInitParameters = {
    params?: Parameters;
}

export interface IContentRenderer extends IDisposable {
    init(parameters: RendererInitParameters): void;
    onShow?(): void;
    onHide?(): void;
    readonly element: HTMLElement;
}