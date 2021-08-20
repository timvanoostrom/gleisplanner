import { derived, get } from 'svelte/store';
import type { Layer, GleisPropsPlanned, LayerControl } from '../types';
import { db } from './appConfig';
// import { deleteGleisActive, gleisPlannedDB } from './index';
import { getColor } from '../helpers/app';
import { patterns } from '../config/svg-fill-patterns';

export const INITIAL_STATE = {
  layers: [
    {
      id: 'base',
      name: 'Base',
      isVisible: true,
      locked: true,
      color: getColor(),
    },
  ],
  activeLayerId: 'base',
};
export const layerControl = db<LayerControl>('layerControl', INITIAL_STATE);

export const layersById = derived(layerControl, ({ layers }) => {
  return Object.fromEntries(layers.map((layer) => [layer.id, layer]));
});

export const activeLayer = derived(
  [layersById, layerControl],
  ([layers, { activeLayerId }]) => layers[activeLayerId]
);

export function updateLayer(
  layersToUpdate: Record<Layer['id'], Partial<Omit<Layer, 'id'>>>
) {
  layerControl.update((layerControl) => {
    const layers = layerControl.layers.map((layer) => {
      if (layersToUpdate[layer.id]) {
        return {
          ...layer,
          ...layersToUpdate[layer.id],
        };
      }
      return layer;
    });
    return {
      ...layerControl,
      layers,
    };
  });
}

export function deleteLayer(id: Layer['id']) {
  layerControl.update((layerControl) => {
    const layers = layerControl.layers.filter((layer) => layer.id !== id);
    return {
      ...layerControl,
      activeLayerId: 'base',
      layers,
    };
  });
}

export const layerPatterns = derived(layerControl, (layerControl) => {
  return layerControl.layers
    .filter((layer) => !!layer.patternId)
    .map((layer) => {
      return patterns[layer.patternId](
        `pattern-${layer.patternId}`,
        layer.color
      );
    });
});
