import "./appbase.css"

import { Component, registerSingleton } from "../../../common/component.js";
import { IAppBase } from "../../common/components/appbase.js";



class AppBase extends Component implements IAppBase {
    constructor() {
        super();

        const _createElem = function() {
            return document.createElement("div");
        }

        this._element    = _createElem();
        this._element.id = "app";

        document.body.appendChild(this._element);
    }

    dispose(): void {
        
    }

    pushScreenStack(_elem: HTMLElement): HTMLElement {
        if (this._screenStack.indexOf(_elem) !== -1) {
            return _elem;
        }

        this._screenStack.push(_elem);
        this._element.appendChild(_elem);

        return _elem;
    }

    popScreenStack(_elem: HTMLElement): HTMLElement {
        const _index = this._screenStack.indexOf(_elem);

        if (_index === -1) {
            return _elem;
        }

        for (let _i=this._screenStack.length-1; _i>=_index; --_i) {
            const _s = this._screenStack[_i];
            _s.remove();
            this._screenStack.splice(_i, 1);
        }

        return _elem;
    }

    get screenStack() {
        return this._screenStack;
    }

    get element() {
        return this._element;
    }

    readonly _element: HTMLElement;
    private _screenStack = [] as HTMLElement[];
}

registerSingleton(IAppBase, AppBase);