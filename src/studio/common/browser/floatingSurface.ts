import "./floatingSurface.css";
import { IRenderer } from "./renderer.js";



export type FloatingSurfaceOptions = {
    renderer?:  IRenderer;
    className?: string;
    id?:        string;
};

export class FloatingSurface {
    constructor(_options?: FloatingSurfaceOptions) {
        this.element           = document.createElement("div");
        this.element.className = "surface-floating" + (_options?.className ? ` ${_options.className}` : "");
        _options?.id ? this.element.id = _options?.id : undefined;
        this.setContentRenderer(_options?.renderer);
    }

    setContentRenderer(_renderer: IRenderer | undefined | null) {
        if (this._content) {
            this._content.element.remove();
            this._content.dispose();
        }

        this._content = _renderer ?? undefined;

        if (this._content) {
            this.element.appendChild(this._content?.element);
        }
    }

    get content() {
        return this._content;
    }

    private _content?: IRenderer;
    readonly element:  HTMLElement;
}