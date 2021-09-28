import { derived, get, writable } from 'svelte/store';
import { MAX_SCALE, MIN_SCALE } from '../config/constants';
import { activeTrackLibId, setActiveTrackLibId } from '../config/trackLib';
import { downloadJSON, generateID } from '../helpers/app';
import type {
  Dimensions,
  GleisPlanSaved,
  Guide,
  Guides,
  Layer,
  Point,
  SavedConfig,
  Slopes,
} from '../types';
import { appConfig, appConfigValue, APP_CONFIG_DEFAULT, db } from './appConfig';
import { gleisPlannedDB } from './gleis';
import {
  INITIAL_STATE as LAYERS_INITIAL_STATE,
  layerControl,
  layersById,
} from './layerControl';

export const [dimensions, setDimensions] =
  appConfigValue<Dimensions>('dimensions');
export const [gridSize, setGridSize] = appConfigValue<Dimensions>('gridSize');
export const [isGridVisible, setGridVisible] =
  appConfigValue<boolean>('gridVisible');

export const [baseGroupTranslation, setViewBoxTranslation] =
  appConfigValue<Point | null>('viewBoxTranslation');

export const viewBoxTranslation = derived(
  [baseGroupTranslation, dimensions],
  ([translation, dimensions]) => {
    if (translation === null) {
      const point = {
        x: -(dimensions.width / 4),
        y: -(dimensions.height / 4),
      };
      return point;
    }
    return translation;
  }
);

export const [selectionToolsEnabled, setSelectionToolsEnabled] =
  appConfigValue<boolean>('selectionToolsEnabled');

export const [scale, setScaleValue] = appConfigValue<number>('scale');

export function setScale(scale: number) {
  if (scale >= MIN_SCALE && scale <= MAX_SCALE) {
    setScaleValue(scale);
  } else {
    throw new Error(
      `scale must be between ${MIN_SCALE} and ${MAX_SCALE}, ${scale} was provided.`
    );
  }
}

export const gleisPlanSaved = db<GleisPlanSaved>('gleisPlanSaved', {});
export const [gleisPlanSavedId, setGleisPlanSavedId] = appConfigValue<string>(
  'gleisPlanSaveIdSelected'
);

export function loadGleisPlanSaved(id: string) {
  const saved = get(gleisPlanSaved)[id];
  if (saved) {
    guides.set(saved.guides);
    layerControl.set(saved.layerControl);
    appConfig.set(saved.appConfig);
    gleisPlannedDB.set(saved.gleisPlanned);
    setActiveTrackLibId(saved.activeTrackLibId);
    setGleisPlanSavedId(id);
  }
}

export function importSavedConfig(
  config: SavedConfig,
  doMerge: boolean = false
) {
  const layerMap = {};

  if (doMerge) {
    for (const layer of config.layerControl.layers) {
      const newLayerId = generateID();
      layerMap[layer.id] = newLayerId;
      layer.id = newLayerId;
    }

    const importedGleis = {};

    for (const gleis of Object.values(config.gleisPlanned)) {
      const newLayerId = layerMap[gleis.layerId];
      if (newLayerId) {
        gleis.id = generateID();
        gleis.layerId = newLayerId;
        importedGleis[gleis.id] = gleis;
      }
    }

    guides.update((guides) => {
      return [
        ...guides,
        ...config.guides
          .filter((guide) => !!layerMap[guide.layerId])
          .map((guide) => {
            return {
              ...guide,
              layerId: layerMap[guide.layerId],
            };
          }),
      ];
    });

    layerControl.update((layerControl) => {
      return {
        ...layerControl,
        layers: [...layerControl.layers, ...config.layerControl.layers],
      };
    });

    gleisPlannedDB.update((gleisPlanned) => {
      return {
        ...gleisPlanned,
        ...importedGleis,
      };
    });
  } else {
    layerControl.set(config.layerControl);
    gleisPlannedDB.set(config.gleisPlanned);
    appConfig.set(config.appConfig);
    guides.set(config.guides);
    saveGleisPlan(config.id, config.name);
  }
}

function createSavedConfig(id: string, name: string) {
  _l('createsaved', id, name);
  return {
    id,
    name,
    activeTrackLibId: get(activeTrackLibId),
    gleisPlanned: get(gleisPlannedDB),
    layerControl: get(layerControl),
    appConfig: get(appConfig),
    guides: get(guides),
    dateUpdated: new Date().toLocaleString('nl-nl'),
  };
}

export function createNewGleisPlan() {
  layerControl.set(LAYERS_INITIAL_STATE);
  gleisPlannedDB.set({});
  appConfig.set(APP_CONFIG_DEFAULT);
  guides.set([]);
  setGleisPlanSavedId('');
}

export function saveGleisPlan(id: string | null, name?: string) {
  const sid = id || generateID();
  gleisPlanSaved.update((gleisPlanSaved) => {
    const saves = {
      ...gleisPlanSaved,
      [sid]: createSavedConfig(sid, gleisPlanSaved[sid]?.name || name),
    };
    return saves;
  });
  setGleisPlanSavedId(sid);
}

export function downloadGleisPlan(name) {
  const id = get(gleisPlanSavedId);
  const fileName = `${Date.now()}-${name}`;
  downloadJSON(JSON.stringify(createSavedConfig(id, name)), fileName);
}

export function deleteGleisPlan(id: string) {
  gleisPlanSaved.update((gleisPlanSaved) => {
    const saves = {
      ...gleisPlanSaved,
    };
    delete saves[id];
    return saves;
  });
  setGleisPlanSavedId((sid) => {
    if (id === sid) {
      return '';
    }
    return sid;
  });
}

export const isRotationActive = writable(false);
export const isDragTranslateActive = writable(true);
export const isConnectionSwitchActive = writable(false);

export function svgCoords(event, element: SVGGeometryElement | SVGSVGElement) {
  if (event?.target?.ownerSVGElement) {
    const ctm = element.getScreenCTM();
    const point = event.target.ownerSVGElement.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    return point.matrixTransform(ctm.inverse());
  }
  return null;
}

export const sidebarState = appConfigValue('sidebarState');
export const guides = db<Guides>('guides', []);
export const slopes = db<Slopes>('slopes', {});
export const [measureToolEnabled, setMeasureToolEnabled] =
  appConfigValue<boolean>('measureToolEnabled');

export const slopesCalculated = derived(slopes, (slopes) =>
  Object.values(slopes)
);

// window.cleanGuides = () => {
//   const layers = get(layersById);
//   guides.update((guides) => {
//     return [];
//   });
// };
// window.assignGuides = () => {
//   const layers = get(layerControl).layers;
//   guides.update((guides) => {
//     return guides.map((guide) => {
//       if (!guide.layerId) {
//         guide.layerId = layers[0].id;
//       }
//       return guide;
//     });
//   });
// };

export const guidesInLayer = derived(
  [guides, layersById],
  ([guides, layersById]) => {
    return guides.filter((guide) => layersById[guide.layerId]?.isVisible);
  }
);

export function createGuide(layerId: Layer['id'], points: Point[]) {
  const newGuide = {
    id: generateID(),
    label: '',
    points,
    layerId,
  };
  guides.update((guides) => {
    return [...guides, newGuide];
  });

  return newGuide;
}

export function updateGuide(guide: Guide) {
  guides.update((guides) => {
    return [...guides.filter(({ id }) => id !== guide.id), guide];
  });
}

export function removeGuide(ids: Array<Guide['id']>) {
  guides.update((guides) => {
    return guides.filter((guide) => !ids.includes(guide.id));
  });
}