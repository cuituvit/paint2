import { Component, createDecorator, registerSingleton } from "./component.js";



export interface IAppBase {
    readonly element: HTMLElement;
}

export const IAppBase = createDecorator<IAppBase>("appbase");

class AppBase extends Component implements IAppBase {
    constructor() {
        super();

        this.element = document.createElement("div");
        this.element.id = "app";
        document.body.appendChild(this.element);
    }

    [Symbol.dispose](): void {
        
    }

    readonly element: HTMLElement;
}

registerSingleton(IAppBase, AppBase);