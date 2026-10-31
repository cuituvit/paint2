import { IDisposable } from "../../../common/disposable.js";
import { Emitter } from "../../../common/event.js";



export class DropTarget implements IDisposable {
    private _onEnter = new Emitter<DragEvent>();
    readonly onEnter = this._onEnter.event;
    
    private _onLeave = new Emitter<DragEvent>();
    readonly onLeave = this._onLeave.event;

    private _onOver = new Emitter<DragEvent>();
    readonly onOver = this._onOver.event;
    
    private _onDrop = new Emitter<DragEvent>();
    readonly onDrop = this._onDrop.event;

    private _dragListener = (_which: Emitter<DragEvent>)=>(_e: DragEvent)=>{
        if (_which === this._onOver || _which === this._onDrop) {
            _e.preventDefault();
            
            if (_which === this._onDrop) {
                this.element.classList.remove("draghover");
            }
        } else {
            if (_which === this._onEnter) {
                this.element.classList.add("draghover");
            } else if (_which === this._onLeave) {
                this.element.classList.remove("draghover");
            }
        }

        _which.invokeListeners(_e);
    };

    constructor(readonly element: HTMLElement) {
        this.element.classList.add("drop-target");
        this.element.addEventListener("dragenter", this._dragListener(this._onEnter));
        this.element.addEventListener("dragleave", this._dragListener(this._onLeave));
        this.element.addEventListener("dragover",  this._dragListener(this._onOver));
        this.element.addEventListener("drop",      this._dragListener(this._onDrop));
    }

    dispose() {
        this.element.classList.remove("drop-target");
        this.element.removeEventListener("dragenter", this._dragListener(this._onEnter));
        this.element.removeEventListener("dragleave", this._dragListener(this._onLeave));
        this.element.removeEventListener("dragover",  this._dragListener(this._onOver));
        this.element.removeEventListener("drop",      this._dragListener(this._onDrop));

        this._onOver.dispose();
        this._onDrop.dispose();
    }
}

export class Draggable implements IDisposable {
    private _onStart = new Emitter<DragEvent>();
    readonly onStart = this._onStart.event;
    
    private _onEnd = new Emitter<DragEvent>();
    readonly onEnd = this._onEnd.event;

    private _dragListener = (_which: Emitter<DragEvent>)=>(_e: DragEvent)=>{
        _which.invokeListeners(_e);
    };

    constructor(readonly element: HTMLElement) {
        if (this.element.draggable) {
            this._previouslyDraggable = true;
        }

        this.element.draggable = true;

        this.element.classList.add("draggable");
        this.element.addEventListener("dragstart", this._dragListener(this._onStart));
        this.element.addEventListener("dragend",   this._dragListener(this._onEnd));
    }

    dispose() {
        if (!this._previouslyDraggable) {
            this.element.draggable = false;
        }

        this.element.classList.remove("draggable");
        this.element.removeEventListener("dragstart", this._dragListener(this._onStart));
        this.element.removeEventListener("dragend",   this._dragListener(this._onEnd));

        this._onStart.dispose();
        this._onEnd.dispose();
    }

    private _previouslyDraggable = false;
}