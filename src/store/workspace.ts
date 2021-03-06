import { derived, get, writable } from 'svelte/store';
import svgPanZoom from 'svg-pan-zoom';
import { activeTrackLibId, setActiveTrackLibId } from '../config/trackLib';
import { downloadJSON, generateID, jsonCopy } from '../helpers/app';
import type {
  Dimensions,
  GleisPlanSaved,
  Guide,
  Guides,
  Layer,
  Point,
  SavedConfig,
  SlopeConfig,
  Slopes,
} from '../types';
import { appConfig, appConfigValue, APP_CONFIG_DEFAULT, db } from './appConfig';
import { gleisPlanned, gleisPlannedDB, setGleisIdActive } from './gleis';
import {
  INITIAL_STATE as LAYERS_INITIAL_STATE,
  layerControl,
  layersById,
} from './layerControl';
import { blocksDB, sectionsDB } from './sections';

const svgPanZoomInstance = svgPanZoom;
type SvgPanZoomInstance = typeof svgPanZoomInstance;

export const [dimensions, setDimensions] =
  appConfigValue<Dimensions>('dimensions');
export const [gridSize, setGridSize] = appConfigValue<Dimensions>('gridSize');
export const [isGridVisible, setGridVisible] =
  appConfigValue<boolean>('gridVisible');
export const [baseGroupTranslation, setViewBoxTranslation] =
  appConfigValue<Point | null>('viewBoxTranslation');
export const gleisPlanSaved = db<GleisPlanSaved>('gleisPlanSaved', {});
export const [gleisPlanSavedId, setGleisPlanSavedId] = appConfigValue<string>(
  'gleisPlanSaveIdSelected'
);

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
    alert('Sections and blocks not merged...');
  } else {
    layerControl.set(config.layerControl);
    gleisPlannedDB.set(config.gleisPlanned);
    appConfig.set(config.appConfig);
    guides.set(config.guides);
    sectionsDB.set(config.sections);
    blocksDB.set(config.blocks);
    saveGleisPlan(config.id, config.name);
  }
}

function createSavedConfig(id: string, name: string): SavedConfig {
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
    sections: get(sectionsDB),
    blocks: get(blocksDB),
  };
}

export function createNewGleisPlan() {
  layerControl.set(jsonCopy(LAYERS_INITIAL_STATE));
  gleisPlannedDB.set({});
  appConfig.set(jsonCopy(APP_CONFIG_DEFAULT));
  guides.set([]);
  setGleisPlanSavedId('');
  sectionsDB.set({});
  blocksDB.set({});
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

export function svgCoords(
  event,
  element: SVGGeometryElement | SVGSVGElement | SVGGElement
) {
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
export const guidesToolShapeType = writable('line');
export const fillDialogActive = writable(false);

type ToolName = 'measure' | 'guides' | 'zoom' | 'routeSimulation' | 'section';
export type ZoomState = { zoom: number; pan: Point };

export const zoomzer = writable<SvgPanZoomInstance>();
export const [currentZoom, setCurrentZoom] =
  appConfigValue<ZoomState>('currentZoom');

interface ToolConfig {
  enabled: boolean;
  data?: any;
  [key: string]: any;
}

interface SectionToolConfig extends ToolConfig {
  action?: 'create' | 'update' | 'delete' | 'addTo';
}

interface BlockToolConfig extends ToolConfig {
  action?: 'create' | 'update' | 'delete' | 'addTo';
}

interface Tools {
  section: SectionToolConfig;
  block: BlockToolConfig;
  measure: ToolConfig;
  guides: ToolConfig;
  zoom: ToolConfig;
  routeSimulation: ToolConfig;
}

export const tools = writable<Tools>({
  measure: { enabled: false },
  guides: { enabled: false },
  zoom: { enabled: false },
  section: { enabled: false },
  block: { enabled: false },
  routeSimulation: { enabled: false },
});

export function disableAllButTools(toolName: ToolName) {
  tools.update((tools) => {
    const toolsFiltered = Object.entries(tools).filter(
      ([name]) => name !== toolName
    );
    for (const [name] of toolsFiltered) {
      tools[name] = { enabled: false };
    }
    return tools;
  });
}

export function toggleTool(name: ToolName, config?: Partial<Tools[ToolName]>) {
  tools.update((tools) => {
    const enabled = tools[name].enabled;

    if (!enabled) {
      tools[name] = {
        ...tools[name],
        ...(config ?? {}),
        enabled: true,
      };
    } else {
      tools[name] = { enabled: false };
    }

    return tools;
  });

  disableAllButTools(name);
}

export function isAnyToolEnabled() {
  return Object.values(get(tools)).some(({ enabled }) => enabled);
}

export const slopesCalculated = derived(slopes, (slopes) =>
  Object.values(slopes)
);

export const slopesByLayerId = derived(
  [slopesCalculated, gleisPlanned],
  ([slopesCalculated, gleisPlanned]) => {
    const byLayerId: Record<Layer['id'], SlopeConfig[]> = {};
    for (const slope of Object.values(slopesCalculated)) {
      const gleis = gleisPlanned[slope.gleisIds[0]];
      if (gleis) {
        const id = gleis.layerId;
        if (!byLayerId[id]) {
          byLayerId[id] = [];
        }
        byLayerId[id].push(slope);
      }
    }
    return byLayerId;
  }
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

// window.selectGleis = (id: string) => {
//   setGleisIdActive(id);
// };

export const guidesInLayer = derived(
  [guides, layersById],
  ([guides, layersById]) => {
    return guides.filter((guide) => layersById[guide.layerId]?.isVisible);
  }
);

export const selectedGuideId = writable(null);

export const activeGuide = derived(
  [selectedGuideId, guidesInLayer],
  ([selectedGuideId, guidesInLayer]) => {
    return guidesInLayer.find((guide) => guide.id === selectedGuideId);
  }
);

interface CreateGuideProps {
  layerId: Layer['id'];
  points: Point[];
  width?: number;
  height?: number;
  transform?: string;
}

export function createGuide({
  layerId,
  points,
  width,
  height,
  transform,
}: CreateGuideProps) {
  const newGuide: Guide = {
    id: generateID(),
    label: '',
    points,
    layerId,
    type: 'line',
  };
  if (width && height) {
    newGuide.type = 'rect';
    newGuide.width = width;
    newGuide.height = height;
    if (transform) {
      newGuide.transform = transform;
    }
  }
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

export type OperationsMode = 'build' | 'control';

export const operationsMode = writable<OperationsMode>('control');

export function toggleOperationsMode() {
  operationsMode.update((opMode) => {
    return opMode === 'build' ? 'control' : 'build';
  });
}
