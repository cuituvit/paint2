import { IContentRenderer, ITabRenderer } from "../../../studio1/common/tile/tile.js";
import { AddTileOptions } from "../../../studio1/common/masonry/masonry.js";




const _components = new Map<string, AddTileOptions>();

export function registerComponent(_key: Parameters<typeof _components.set>[0], _val: Parameters<typeof _components.set>[1]) {
    return _components.set(_key, _val);
}

export function getComponent(_key: Parameters<typeof _components.get>[0]) {
    return _components.get(_key);
}

export function getComponents() {
    return _components.values().toArray();
}

const _tabRenderers = new Map<string, new()=>ITabRenderer>();

export function registerTabRenderer(_key: Parameters<typeof _tabRenderers.set>[0], _val: Parameters<typeof _tabRenderers.set>[1]) {
    return _tabRenderers.set(_key, _val);
}

export function getTabRenderer(_key: Parameters<typeof _tabRenderers.get>[0]) {
    return _tabRenderers.get(_key);
}

const _contentRenderers = new Map<string, new()=>IContentRenderer>();

export function registerContentRenderer(_key: Parameters<typeof _contentRenderers.set>[0], _val: Parameters<typeof _contentRenderers.set>[1]) {
    return _contentRenderers.set(_key, _val);
}

export function getContentRenderer(_key: Parameters<typeof _contentRenderers.get>[0]) {
    return _contentRenderers.get(_key);
}