import { vec2 } from "gl-matrix";
import { createDecorator } from "../../../common/component.js";
import { Event } from "../../../common/event.js";



export interface CanvasPointerEvent {
    phase: "down" | "move" | "up";
    event: PointerEvent;
}

export interface ICanvasEvents {
    readonly onPointer: Event<CanvasPointerEvent>;
}

export interface ICanvasParameters {
    pan(_delta: vec2):            void;
    zoom(_delta: number):         void;
    setZoomTarget(_delta: vec2):  void;
    translatePoint(_coord: vec2): void;
}

export interface ICanvasElement {
    readonly element: HTMLCanvasElement;
}

export type ICanvas  = ICanvasEvents & ICanvasParameters & ICanvasElement;
export const ICanvas = createDecorator<ICanvas>("canvas");