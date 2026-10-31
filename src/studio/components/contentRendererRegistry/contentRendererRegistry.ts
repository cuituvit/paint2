import { Component, createDecorator, registerSingleton } from "../../../common/component.js";
import { IContentRendererRegistry } from "../../common/components/contentRendererRegistry.js";
import { IRenderer } from "../../common/browser/renderer.js";



class ContentRendererRegistry extends Component implements IContentRendererRegistry {
    constructor() {
        super();
    }

    dispose() {
        
    }

    register(_name: string, _fn: () => IRenderer) {
        if (_DEV)
        if (this._contentRenderers.has(_name)) {
            console.warn(`Replacing ContentRenderer ${_name}`);
        }
        this._contentRenderers.set(_name, _fn);
    }

    remove(_name: string) {
        return this._contentRenderers.delete(_name);
    }
    
    get create() {
        return (_id: string): IRenderer => {
            const _renderer = this._contentRenderers.get(_id);
            if (!_renderer) {
                throw Error(`Content renderer ${_id} missing`);
            }
            return _renderer();
        }
    }

    private _contentRenderers = new Map<string, ()=>IRenderer>();    
}

registerSingleton(IContentRendererRegistry, ContentRendererRegistry);