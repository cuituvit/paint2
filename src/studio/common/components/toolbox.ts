import { createDecorator } from "../../../common/component.js";
import { IDisposable } from "../../../common/disposable.js";
import { ITool } from "../tool.js";



export interface IToolboxEvents {

}

export type ToolboxAddToolOptions = {
    id:   string;
    name: string;
    tool: ITool;
};

export interface IToolboxTools {
    addTool(_options: ToolboxAddToolOptions): IDisposable;
    toolIds:                                  string[];
}

export interface IToolboxRenderer {
    render(): void;
}

export interface IToolboxElement {
    readonly element: HTMLElement;
}

export type IToolbox  = IToolboxEvents & IToolboxTools & IToolboxRenderer & IToolboxElement;
export const IToolbox = createDecorator<IToolbox>("toolbox");