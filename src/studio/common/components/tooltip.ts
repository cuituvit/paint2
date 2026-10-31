import { createDecorator } from "../../../common/component.js";
import { IDisposable } from "../../../common/disposable.js";
import { IRenderer } from "../browser/renderer.js";



export interface ITooltipRenderer {
    render(): IRenderer;
}

export interface ITooltipTooltip {
    addTooltip(_element: HTMLElement, _text: string, _sub?: string): IDisposable;
}

export interface ITooltipElement {
    readonly element: HTMLElement;
}

export type ITooltip  = ITooltipRenderer & ITooltipTooltip & ITooltipElement;
export const ITooltip = createDecorator<ITooltip>("tooltip");