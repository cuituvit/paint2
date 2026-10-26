import { DisposableStack } from "../../../../common/disposable.js";
import { HTMLElementEventListener } from "../../../../common/event.js";
import { RendererInitParameters } from "../../../common/contentRenderer.js";
import { IMasonryTile } from "../../../common/masonry.js";
import { _ITabRenderer, _MasonryTile } from "./masonryTile.js";



export class _TileTabRenderer implements _ITabRenderer {
    private readonly _disposableStack = new DisposableStack;

    constructor() {
        this.element = document.createElement("div");
    }

    dispose(): void {
        this._disposableStack.dispose();
    }


    init(parameters: { title: string; } & RendererInitParameters): void {
        this.element.textContent = parameters.title;
        this._tile               = parameters.params!.tile as IMasonryTile;
        this._lastPos            = [this._tile.x, this._tile.y];

        this._disposableStack.use(new HTMLElementEventListener(this.element, "pointerdown", (_e: PointerEvent)=>{
            if (!this._tile) {
                return;
            }

            if (_e.button !== 0) {
                return;
            }

            this.element.setPointerCapture(_e.pointerId);
            this._drag    = true;
        }));

        this._disposableStack.use(new HTMLElementEventListener(this.element, "pointerup", (_e: PointerEvent)=>{
            this.element.releasePointerCapture(_e.pointerId);
            this._drag    = false;

            if (this._relaseTimeout) {
                clearTimeout(this._relaseTimeout);
            }

            this._relaseTimeout = setTimeout(()=>{
                if (!this._tile) {
                    return;
                }
                
                this._tile.x = this._lastPos[0];
                this._tile.y = this._lastPos[1];
            }, 250);
        }));

        this._disposableStack.use(new HTMLElementEventListener(this.element, "pointermove", (_e: PointerEvent)=>{
            if (!this._drag) {
                return;
            } if (!this._tile) {
                return;
            }

            this._tile.x += _e.movementX;
            this._tile.y += _e.movementY;
        }));

        this._disposableStack.adopt(this._relaseTimeout, _v=>{
            clearTimeout(_v);
        });
    }

    private _drag    = false;
    private _lastPos = [0, 0] as [number, number];
    private _relaseTimeout: NodeJS.Timeout | undefined;
    private _tile:          IMasonryTile | undefined;

    element: HTMLElement;
}