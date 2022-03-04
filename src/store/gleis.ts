import { derived, get, writable } from 'svelte/store';
import {
  ROOT_POINT_ORIGIN_CONNECT_ANGLE,
  ROOT_POINT_ORIGIN_DIRECTION,
} from '../config/constants';
import { trackLib, trackLibByArtNr } from '../config/trackLib';
import { generateID, round } from '../helpers/app';
import {
  calculateCrossingPoints,
  generateCrossingPaths,
} from '../helpers/crossing';
import { calculateCurvePoints, generateCurvePaths } from '../helpers/curve';
import { calculateEngelsPoints, generateEngelsPaths } from '../helpers/engels';
import { generateFlexPaths } from '../helpers/flex';
import { getConnectedPoint } from '../helpers/gleis';
import {
  calculateStraightPoints,
  generateStraightPaths,
} from '../helpers/straight';
import {
  calculateThreeWayPoints,
  generateThreeWayPaths,
} from '../helpers/threeWay';
import {
  calculateTurnoutPoints,
  generateTurnoutPaths,
} from '../helpers/turnout';
import {
  calculateTurnoutCurvedPoints,
  generateTurnoutCurvedPaths,
} from '../helpers/turnoutCurved';
import type {
  GleisPlanned,
  GleisPropsPlanned,
  PathSegmentProps,
  Point,
  ProtoGleis,
  ProtoGleisSegment,
  ProtoSegmentCurve,
  ProtoSegmentFlex,
  ProtoSegmentStraight,
  ProtoTurnoutSegments,
} from '../types';
import { appConfigValue, db } from './appConfig';
import { activeLayer, layerControl, layersById } from './layerControl';

export const protoGleisIdActive = appConfigValue<string>('protoGleisIdActive');

export const protoGleisActive = derived(
  [protoGleisIdActive[0], trackLib],
  ([protoGleisIdActive, trackLib]) =>
    trackLib.find((track) => track.id === protoGleisIdActive)!
);

export const [gleisIdsActive, setGleisIdsActive] =
  appConfigValue<string[]>('gleisIdsActive');

export function setGleisIdActive(id: string, isMulti: boolean = false) {
  setGleisIdsActive((ids) => {
    if (ids.includes(id)) {
      return ids.filter((sid) => sid !== id);
    }
    return isMulti ? [...ids, id] : [id];
  });
}

export function unsetGleisIdActive(deselectIds: string[]) {
  setGleisIdsActive((ids) => ids.filter((id) => !deselectIds.includes(id)));
}

export const gleisPlannedDB = db<GleisPlanned>('gleisPlanned', {});

export const gleisPlanned = derived(
  [gleisPlannedDB, layersById],
  ([gleisPlannedDB, layersById]) => {
    const gleisPlannedEntries = Object.entries(gleisPlannedDB);
    const visibleGleisPlanned = gleisPlannedEntries.filter(
      ([id, { layerId }]) => {
        return layersById[layerId]?.isVisible;
      }
    );
    const entries = Object.fromEntries(visibleGleisPlanned);
    return entries;
  }
);

export function updateGleisPlanned(
  value: GleisPlanned | ((value: GleisPlanned) => GleisPlanned)
) {
  gleisPlannedDB.update((gleisPlanned) => {
    if (typeof value === 'function') {
      return value(gleisPlanned);
    } else {
      return {
        ...gleisPlanned,
        ...value,
      };
    }
  });
}

export function updateGleis(
  gleisToUpdate: Array<
    Partial<GleisPropsPlanned> & {
      id: GleisPropsPlanned['id'];
    }
  >
) {
  updateGleisPlanned((gleis) => {
    const gleisUpdated = {
      ...gleis,
    };

    for (const gleisProps of gleisToUpdate) {
      const gleisPropsSource = gleis[gleisProps.id] || {};
      const gleisUpdatePayload = {
        ...gleisPropsSource,
        ...gleisProps,
      } as unknown as GleisPropsPlanned;

      for (const [key, val] of Object.entries(gleisUpdatePayload)) {
        if (val === undefined) {
          delete gleisUpdatePayload[key];
        }
      }

      if ('points' in gleisProps) {
        const proto = get(trackLibByArtNr)[gleisUpdatePayload.artnr];
        const segments = generateSegments(gleisUpdatePayload, proto);

        gleisUpdatePayload.pathSegments = segments.map((ps) => {
          return {
            ...ps,
            d: ps.d.toString(),
          };
        });
      }

      gleisUpdated[gleisProps.id] = gleisUpdatePayload;
    }
    return gleisUpdated;
  });
  // updateGleisPlanned(gleisUpdated);
}

export const gleisPlannedUnselected = derived(
  [gleisIdsActive, gleisPlanned],
  ([gleisIdsActive, gleisPlanned]) => {
    return Object.values(gleisPlanned).filter(
      (gleis: GleisPropsPlanned): gleis is GleisPropsPlanned =>
        !gleisIdsActive.includes(gleis.id)
    );
  }
);

export const gleisPlannedUnselectedByLayerId = derived(
  [gleisIdsActive, gleisPlanned, layerControl],
  ([gleisIdsActive, gleisPlanned, layerControl]) => {
    const layers: Record<string, GleisPropsPlanned[]> = {};
    for (const gleis of Object.values(gleisPlanned).filter(
      (gleis: GleisPropsPlanned): gleis is GleisPropsPlanned =>
        !gleisIdsActive.includes(gleis.id)
    )) {
      if (!layers[gleis.layerId]) {
        layers[gleis.layerId] = [];
      }
      layers[gleis.layerId].push(gleis);
    }
    const layerIds = layerControl.layers.map((layer) => layer.id).reverse();
    const layerz: Record<string, GleisPropsPlanned[]> = Object.fromEntries(
      layerIds
        .map((id) => {
          return id in layers ? [id, layers[id]] : null;
        })
        .filter((keyval) => !!keyval)
    );
    return layerz;
  }
);

export const gleisPlannedSelectedByLayerId = derived(
  [gleisIdsActive, gleisPlanned, layerControl],
  ([gleisIdsActive, gleisPlanned, layerControl]) => {
    const layers: Record<string, GleisPropsPlanned[]> = {};
    for (const gleis of Object.values(gleisPlanned).filter(
      (gleis: GleisPropsPlanned): gleis is GleisPropsPlanned =>
        gleisIdsActive.includes(gleis.id)
    )) {
      if (!layers[gleis.layerId]) {
        layers[gleis.layerId] = [];
      }
      layers[gleis.layerId].push(gleis);
    }
    const layerIds = layerControl.layers.map((layer) => layer.id).reverse();
    const layerz: Record<string, GleisPropsPlanned[]> = Object.fromEntries(
      layerIds
        .map((id) => {
          return id in layers ? [id, layers[id]] : null;
        })
        .filter((keyval) => !!keyval)
    );
    return layerz;
  }
);

export const gleisPlannedSelected = derived(
  [gleisIdsActive, gleisPlanned],
  ([gleisIdsActive, gleisPlanned]) => {
    const gleisPlannedSelected: GleisPropsPlanned[] = [];
    for (const id of gleisIdsActive) {
      if (id in gleisPlanned) {
        gleisPlannedSelected.push(gleisPlanned[id]);
      }
    }
    return gleisPlannedSelected;
  }
);

export const singleFlexActive = derived(
  [gleisPlannedSelected],
  ([gleisPlannedSelected]) => {
    return gleisPlannedSelected.length === 1 &&
      gleisPlannedSelected[0].type === 'Flex'
      ? gleisPlannedSelected[0]
      : null;
  }
);

export const gleisPlannedAll = derived(
  [gleisIdsActive, gleisPlanned, layerControl],
  ([gleisIdsActive, gleisPlanned, layerControl]) => {
    const layers = {};
    for (const gleis of Object.values<GleisPropsPlanned>(gleisPlanned)) {
      let layerId = gleis.layerId;
      if (gleisIdsActive.includes(gleis.id)) {
        layerId = 'selected';
      }
      if (!layers[layerId]) {
        layers[layerId] = [];
      }
      layers[layerId].push(gleis);
    }
    return [{ id: 'selected' }, ...layerControl.layers]
      .reverse()
      .flatMap((layer, index) => {
        return layers[layer.id] || [];
      });
  }
);

export function generateSegments(
  gleis: GleisPropsPlanned,
  proto: ProtoGleis
): PathSegmentProps[] {
  const protoSegments = proto.segments;

  switch (gleis.type) {
    case 'Flex':
      return generateFlexPaths(
        gleis.points,
        protoSegments[0] as ProtoSegmentFlex
      );
    case 'Straight':
      return generateStraightPaths(
        gleis.points,
        protoSegments[0] as ProtoSegmentStraight
      );
    case 'Curve':
      return generateCurvePaths(
        gleis.points,
        protoSegments[0] as ProtoSegmentCurve
      );
    case 'Turnout':
      return generateTurnoutPaths(
        gleis.points,
        protoSegments as ProtoTurnoutSegments
      );
    case 'TurnoutCurved':
      return generateTurnoutCurvedPaths(
        gleis.points,
        protoSegments as ProtoSegmentCurve[]
      );
    case 'Crossing':
      return generateCrossingPaths(
        gleis.points,
        protoSegments as ProtoSegmentStraight[]
      );
    case 'Engels':
      return generateEngelsPaths(
        gleis.points,
        protoSegments as ProtoSegmentStraight[]
      );
    case 'ThreeWay':
      return generateThreeWayPaths(
        gleis.points,
        protoSegments as ProtoTurnoutSegments
      );
  }
}

interface ConnectGleisProps {
  pointOrigin: Point;
  flexPoints?: Point[];
}
export function connectGleis({ pointOrigin, flexPoints }: ConnectGleisProps) {
  const layer = get(activeLayer);

  if (layer?.locked || !layer?.isVisible) {
    alert('Layer is not accessible');
    return;
  }

  const activeProtoGleis: ProtoGleis<ProtoGleisSegment> = get(protoGleisActive);

  if (!activeProtoGleis) {
    return;
  }

  const connectedGleis = findConnectingGleis(pointOrigin);
  const connectingPointOrigin = connectedGleis?.points.find((p) => {
    return p.x === pointOrigin.x && p.y === pointOrigin.y;
  });
  const id = generateID();
  const artnr = activeProtoGleis.artnr;
  const layerId = layer.id;
  const type = activeProtoGleis.type;
  const points: Point[] = [];

  switch (type) {
    case 'Flex':
      points.push(...flexPoints);
      break;
    case 'Straight':
      {
        const [protoSegment] =
          activeProtoGleis.segments as ProtoSegmentStraight[];
        points.push(
          ...calculateStraightPoints(
            pointOrigin,
            protoSegment,
            connectingPointOrigin
          )
        );
      }
      break;
    case 'Curve':
      {
        const [protoSegment] = activeProtoGleis.segments as ProtoSegmentCurve[];
        points.push(
          ...calculateCurvePoints({
            pointOrigin,
            proto: protoSegment,
            connectingPointOrigin,
          })
        );
      }
      break;
    case 'Turnout':
      {
        points.push(
          ...calculateTurnoutPoints({
            pointOrigin,
            protos: activeProtoGleis.segments as ProtoTurnoutSegments,
            connectingPointOrigin,
          })
        );
      }
      break;
    case 'TurnoutCurved':
      {
        points.push(
          ...calculateTurnoutCurvedPoints({
            pointOrigin,
            protos: activeProtoGleis.segments as ProtoSegmentCurve[],
            connectingPointOrigin,
          })
        );
      }
      break;
    case 'Crossing':
      {
        points.push(
          ...calculateCrossingPoints({
            pointOrigin,
            protos: activeProtoGleis.segments as ProtoSegmentStraight[],
            connectingPointOrigin,
          })
        );
      }
      break;
    case 'Engels':
      {
        points.push(
          ...calculateEngelsPoints({
            pointOrigin,
            protos: activeProtoGleis.segments as ProtoSegmentStraight[],
            connectingPointOrigin,
            doubleSlip: activeProtoGleis.title.startsWith('DKW'),
          })
        );
      }
      break;
    case 'ThreeWay':
      {
        points.push(
          ...calculateThreeWayPoints({
            pointOrigin,
            protos: activeProtoGleis.segments as ProtoTurnoutSegments,
            connectingPointOrigin,
          })
        );
      }
      break;
  }

  const gleis: GleisPropsPlanned = {
    points,
    id,
    artnr,
    layerId,
    type,
    pathSegments: [],
  };

  updateGleis([gleis]);
  addToPointConnections(gleis);

  setGleisIdActive(id);
}

export function deleteGleisActive(ids?: string[]) {
  let idsToDelete = ids ? ids : get(gleisIdsActive);
  let lastId;

  updateGleisPlanned((gleisPlanned) => {
    const gleis = {
      ...gleisPlanned,
    };
    for (const id of idsToDelete) {
      if (id in gleis) {
        removeFromPointConnections(gleis[id]);
        delete gleis[id];
      }
    }

    const ids = Object.keys(gleis);
    lastId = ids[ids.length - 1];

    return gleis;
  });

  unsetGleisIdActive(idsToDelete);

  if (lastId) {
    setGleisIdActive(lastId);
  }
}

export function findConnectingGleis(
  point: Point,
  cid?: GleisPropsPlanned['id']
): GleisPropsPlanned | undefined {
  return findConnection(get(gleisPlannedDB), point, cid);
}

export function findConnection(
  gleisAll: GleisPlanned,
  point: Point,
  cid?: GleisPropsPlanned['id']
): GleisPropsPlanned | undefined {
  const ids = getConnectedPoint(point);
  if (!ids) {
    return;
  }
  const [connectingId] = ids.filter((id) => !cid || id !== cid);
  return connectingId ? gleisAll[connectingId] : undefined;
}

export function findConnectingPointOrigin(
  pointOrigin: Point,
  cid?: GleisPropsPlanned['id']
): [Point, GleisPropsPlanned] | [undefined, undefined] {
  const connectingGleis = findConnectingGleis(pointOrigin, cid);
  const connectingPointOrigin = connectingGleis?.points.find((p) => {
    return pointOrigin.type === 'c1' ? p.type === 'c2' : p.type === 'c1';
  });

  if (!connectingPointOrigin) {
    return [undefined, undefined];
  }

  return [connectingPointOrigin, connectingGleis];
}

export function getCoordString({ x, y }: Point) {
  return round(x, 0) + ',' + round(y, 0);
}

export const isCutPathActive = writable(false);
export const pointConnections = writable({});

// TODO: Implement incremental updates of the Map
function addToPointConnections(gleis: GleisPropsPlanned) {
  const c = get(pointConnections);

  for (const p of gleis.points) {
    if (p.type === 'c1' || p.type === 'c2') {
      const coordString = getCoordString(p);
      if (!(coordString in c)) {
        c[coordString] = [gleis.id];
      } else if (!c[coordString].includes(gleis.id)) {
        c[coordString] = [...c[coordString], gleis.id];
      }
    }
  }

  pointConnections.set(c);
}

function removeFromPointConnections(gleis: GleisPropsPlanned) {
  const c = get(pointConnections);

  for (const p of gleis.points) {
    if (p.type === 'c1' || p.type === 'c2') {
      const coordString = getCoordString(p);
      if (coordString in c) {
        c[coordString] = [...c[coordString].filter((id) => id !== gleis.id)];
        if (!c[coordString].length) {
          delete c[coordString];
        }
      }
    }
  }

  pointConnections.set(c);
}

let unsubscribeConnections = gleisPlannedAll.subscribe((gleisAll) => {
  if (gleisAll.length) {
    const c = get(pointConnections);
    for (const gleis of gleisAll) {
      for (const p of gleis.points) {
        if (p.type === 'c1' || p.type === 'c2') {
          const coordString = getCoordString(p);
          if (!(coordString in c)) {
            c[coordString] = [gleis.id];
          } else if (!c[coordString].includes(gleis.id)) {
            c[coordString] = [...c[coordString], gleis.id];
          }
        }
      }
    }
    pointConnections.set(c);
    unsubscribeConnections();
  }
});

export function getRootPointOrigin(x: number, y: number): Point {
  return {
    x,
    y,
    connectAngle: ROOT_POINT_ORIGIN_CONNECT_ANGLE,
    direction: ROOT_POINT_ORIGIN_DIRECTION,
    root: true,
  };
}

export function shortCircuitConnections() {
  // points that are in same layer and same type (done)
  // points that are not in same layer but same type and endpoints (todo)
  return derived(
    [gleisPlanned, gleisIdsActive],
    ([gleisPlanned, gleisIdsActive]) => {
      const scc = [];
      const shortCircuitCoords = {};

      for (const gleis of Object.values<GleisPropsPlanned>(gleisPlanned)) {
        for (const p of gleis.points) {
          if (p.type === 'c1' || p.type === 'c2') {
            const coordString = `${gleis.layerId}-${getCoordString(p)}`;
            if (!shortCircuitCoords[coordString]) {
              shortCircuitCoords[coordString] = [{ p, id: gleis.id }];
            } else if (p.type === shortCircuitCoords[coordString][0].p.type) {
              shortCircuitCoords[coordString].push({ p, id: gleis.id });

              const pointsAtCoord = shortCircuitCoords[coordString];
              const isSameLayer =
                gleis.layerId === gleisPlanned[pointsAtCoord[0].id].layerId;

              // const isLayerConnection = !isSameLayer &&
              // the opposite point of connecting gleis also has connection

              if (isSameLayer) {
                scc.push(p);
              }
            }
          }
        }
      }

      return scc;
    }
  );
}

type PointString = string;
type GleisConnectionType = string;

export type Combo = [
  PointString,
  GleisPropsPlanned,
  GleisConnectionType,
  PointString,
  GleisPropsPlanned,
  GleisConnectionType
];

export const gleisBezetz = writable<Record<GleisPropsPlanned['id'], Combo>>({});

// window.removeLastGleis = () => {
//   const entries: Array<[string, GleisPropsPlanned]> = Object.entries(
//     get(gleisPlanned)
//   );
//   entries.pop();
//   gleisPlannedDB.set(Object.fromEntries(entries));
// };

window.assignPathPoints = function assignPathPoints() {
  updateGleisPlanned((gleisPlanned) => {
    Object.entries(gleisPlanned).forEach(([id, gleis]) => {
      let prevSegment;
      gleis.pathSegments = gleis.pathSegments.map((path, index) => {
        if (path.type !== 'main') {
          return path;
        }

        switch (gleis.type) {
          case 'Crossing':
          case 'Engels':
            {
              const points = [];
              let skip = 0;
              for (const p of gleis.points) {
                if (p.type === 'c1' || p.type === 'c2') {
                  if (prevSegment && skip >= 2) {
                    points.push(getCoordString(p));
                  } else if (!prevSegment && skip < 2) {
                    points.push(getCoordString(p));
                  }
                  skip += 1;
                }
              }
              path.gleisType = !!prevSegment ? 'Straight2' : 'Straight';
              path.points = points;
            }
            break;
          case 'Flex':
          case 'Straight':
          case 'Curve':
            path.points = gleis.points
              .filter((p) => p.type === 'c1' || p.type === 'c2')
              .map((p) => getCoordString(p));
            path.gleisType = gleis.type;
            break;
          case 'Turnout':
          case 'TurnoutCurved':
            {
              const points = [];
              let skip = 0;
              for (const p of gleis.points) {
                if (p.type === 'c1' || p.type === 'c2') {
                  if (prevSegment && skip >= 2) {
                    points.push(getCoordString(p));
                    if (skip === 2) {
                      points.push(prevSegment.points[0]);
                    }
                  } else if (!prevSegment && skip < 2) {
                    points.push(getCoordString(p));
                  }
                  skip += 1;
                }
              }
              if (gleis.type === 'TurnoutCurved') {
                path.gleisType = !!prevSegment ? 'Curve2' : 'Curve';
              } else {
                path.gleisType = !!prevSegment ? 'Curve' : 'Straight';
              }

              path.points = points;
            }
            break;

          case 'ThreeWay':
            // TODO: Implement!!!
            break;
        }
        prevSegment = path;
        return path;
      });

      return [id, gleis];
    });
    return gleisPlanned;
  });
};

export const gleisPlannedWithPaths = derived(
  [gleisPlannedDB, trackLibByArtNr],
  ([gleisPlannedDB, trackLibByArtNr]) => {
    const gleisPlannedEntries = Object.entries(gleisPlannedDB).map(
      ([id, gleis]) => {
        let g = gleis;
        if (!g.pathSegments) {
          g = Object.assign({}, gleis, {
            pathSegments: generateSegments(gleis, trackLibByArtNr[gleis.artnr]),
          });
        }
        return [id, g] as const;
      }
    );
    return gleisPlannedEntries;
  }
);

window.updateGleisPlanned = () => {
  const withPaths = get(gleisPlannedWithPaths);
  updateGleisPlanned(() =>
    Object.fromEntries(
      withPaths.map(([id, gleis]) => {
        // let points = gleis.points;
        // if (gleis.type === 'Flex' && points[0].type === 'c2') {
        //   const [c2, cp1, cp2, c1] = points;
        //   points = [c1, cp1, cp2, c2];
        // } else if (points[0].type === 'c2') {
        //   const [c2, c1] = points;
        //   points = [c1, c2];
        // }
        return [
          id,
          Object.assign(gleis, {
            // points,
            pathSegments: gleis.pathSegments.map((ps) => {
              return {
                ...ps,
                d: ps.d.toString(),
              };
            }),
          }),
        ];
      })
    )
  );
};

// window.updateIds = () => {
//   const gleis = JSON.parse(JSON.stringify(get(gleisPlanned)));
//   for (const [id, g] of Object.entries(gleis)) {
//     const newID = generateID();
//     gleis[newID] = {
//       ...(g as any),
//       id: newID,
//     };
//     delete gleis[id];
//   }
//   gleisPlannedDB.set(gleis);
// };

// window.cleanGleisPlanned = () => {
//   const layers = get(layersById);
//   gleisPlannedDB.update((gleisPlanned) => {
//     const cleaned = {};
//     for (const [id, gleis] of Object.entries(gleisPlanned)) {
//       if (layers[gleis.layerId] && gleis.points.length) {
//         cleaned[id] = gleis;
//       }
//     }
//     return cleaned;
//   });
// };
