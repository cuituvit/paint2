import { createDecorator } from "../../../common/component.js";



export interface IAppBaseScreenStack {
    pushScreen(_elem: HTMLElement): HTMLElement;
    popScreen(_elem: HTMLElement):  HTMLElement;
    readonly screenStack:                HTMLElement[];
}

export interface IAppBaseElement {
    readonly element: HTMLElement;
}

export type IAppBase  = IAppBaseElement & IAppBaseScreenStack;
export const IAppBase = createDecorator<IAppBase>("appbase");