import { createDecorator } from "../component.js";
import { IP2Document, IPixelLayer, P2DocumentOptions, PixelLayerOptions } from "../document.js";
import { Event } from "../event.js";



export interface IEnginePixelLayers {
    createPixelLayer(_document: IP2Document, _options: Omit<PixelLayerOptions, "device">): IPixelLayer;
}

export interface EngineDocumentCreateEvent {
    document: IP2Document;
}

export interface IEngineDocumentRegistryEvents {
    readonly onDocumentCreate: Event<EngineDocumentCreateEvent>;
}

export interface IEngineDocumentRegistry {
    createDocument(_options: P2DocumentOptions): IP2Document;
    readonly activeDocument: IP2Document | undefined;
    readonly documents:      IP2Document[];
}

export type IEngineEvents = IEngineDocumentRegistryEvents;
export type IEngine       = IEnginePixelLayers & IEngineDocumentRegistry & IEngineEvents;
export const IEngine      = createDecorator<IEngine>("engine");