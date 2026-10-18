import "./default-tab-renderer.css";

import { ITabRenderer, RendererInitParameters, Tile } from "../../layout/common/tile.js";
import { registerTabRenderer } from "./registry.js";
import { Listener } from "../../../common/disposable.js";



class DefaultTabRenderer extends DisposableStack implements ITabRenderer {
    constructor() {
        super();
        this.element = document.createElement("div");
        this.element.classList.add("default-tab");
    }

    init(parameters: RendererInitParameters): void {
        this.element.textContent = parameters.title;
        this._tile               = parameters.tile;
        this._lastPos            = [this._tile.x, this._tile.y];

        this.use(new Listener(this.element, "pointerdown", (_e: PointerEvent)=>{
            if (!this._tile) {
                return;
            }

            if (_e.button !== 0) {
                return;
            }

            this.element.setPointerCapture(_e.pointerId);
            this._drag    = true;
        }));

        this.use(new Listener(this.element, "pointerup", (_e: PointerEvent)=>{
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

        this.use(new Listener(this.element, "pointermove", (_e: PointerEvent)=>{
            if (!this._drag) {
                return;
            } if (!this._tile) {
                return;
            }

            this._tile.x += _e.movementX;
            this._tile.y += _e.movementY;
        }));

        this.adopt(this._relaseTimeout, _v=>{
            clearTimeout(_v);
        });
    }

    private _drag    = false;
    private _lastPos = [0, 0] as [number, number];
    private _relaseTimeout: NodeJS.Timeout | undefined;
    private _tile:          Tile | undefined;

    element: HTMLElement;
}

registerTabRenderer("default", DefaultTabRenderer);