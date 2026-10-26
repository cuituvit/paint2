import { createDecorator } from "../component.js";
import { IP2Document, IPixelLayer, P2DocumentOptions, PixelLayerOptions } from "../document.js";
import { Event } from "../event.js";



export interface IEnginePixelLayers {
    createPixelLayer(_document: IP2Document, _options: Omit<PixelLayerOptions, "device">): IPixelLayer;
}

export interface EngineDocumentEvent {
    document?: IP2Document;
}

export interface IEngineDocumentRegistryEvents {
    readonly onDocumentCreate:        Event<EngineDocumentEvent>;
    readonly onActiveDocumentChanged: Event<EngineDocumentEvent>;
}

export interface IEngineDocumentRegistry {
    createDocument(_options: P2DocumentOptions): IP2Document;
    setActiveDocument(_document: IP2Document):   IP2Document;
    setActiveDocument(_index: number):           IP2Document | undefined;
    setActiveDocument(_none: undefined):         undefined;
    readonly activeDocument:                     IP2Document | undefined;
    readonly documents:                          IP2Document[];
}

export type IEngineEvents = IEngineDocumentRegistryEvents;
export type IEngine       = IEnginePixelLayers & IEngineDocumentRegistry & IEngineEvents;
export const IEngine      = createDecorator<IEngine>("engine");