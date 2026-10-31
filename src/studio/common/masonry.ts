import { IDisposable } from "../../common/disposable.js";
import { Parameters } from "../../common/utility.js";
import { _ITabRenderer } from "../components/screens/menu/masonryTile.js";
import { IRenderer, RendererInitParameters } from "./browser/renderer.js";
import { Freeform, FreeFormOptions } from "./dom/freeform.js";



export type MasonryTileInitParameters = RendererInitParameters & {
    title?: string;
}

export type MasonryTileOptions = FreeFormOptions & MasonryTileInitParameters & {
    className?:      string;
    contentRenderer: IRenderer;
}

export interface IMasonryTile extends Freeform, IDisposable {
    init(params: MasonryTileInitParameters): void;
    setTitle(_val?: string):                 void;
    readonly content:                        IRenderer;
    readonly tab:                            _ITabRenderer;
    readonly title:                          string | undefined;
    readonly params:                         Parameters | undefined;
    readonly pinned:                         boolean;
}

export type MasonryAddTileOptions = Omit<MasonryTileOptions, "contentRenderer"> & {
    tileId:            string;
    contentRendererId: string;
};