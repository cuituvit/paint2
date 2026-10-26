import { createDecorator } from "../../../common/component.js";
import { Event } from "../../../common/event.js";



export interface CanvasPointerEvent extends PointerEvent {
    phase: "down" | "move" | "up";
}

export interface ICanvasEvents {
    readonly onPointer: Event<CanvasPointerEvent>;
}

export interface ICanvasElement {
    readonly element: HTMLCanvasElement;
}

export type ICanvas  = ICanvasEvents & ICanvasElement;
export const ICanvas = createDecorator<ICanvas>("canvas");