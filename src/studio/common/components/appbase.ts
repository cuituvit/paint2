import { createDecorator } from "../../../common/component.js";



export interface IAppBaseScreenStack {
    pushScreenStack(_elem: HTMLElement): HTMLElement;
    popScreenStack(_elem: HTMLElement):  HTMLElement;
    readonly screenStack:                HTMLElement[];
}

export interface IAppBaseElement {
    readonly element: HTMLElement;
}

export type IAppBase  = IAppBaseElement & IAppBaseScreenStack;
export const IAppBase = createDecorator<IAppBase>("appbase");