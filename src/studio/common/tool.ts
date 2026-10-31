import { CanvasPointerEvent } from "./components/canvas.js";



export interface ITool {
    onActivate?(): void;
    onPointer?(event: CanvasPointerEvent): void;
}