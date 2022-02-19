import { onDestroy } from 'svelte';
import { derived, get } from 'svelte/store';
import {
  findConnection,
  getCoordString,
  gleisBezetz,
  gleisPlannedUnselectedByLayerId,
} from './store/gleis';
import { layerControl } from './store/layerControl';
import { tools } from './store/workspace';
import type { GleisPropsPlanned, Point } from './types';

const activeLayerGleisById = derived(
  [gleisPlannedUnselectedByLayerId, layerControl],
  ([gleisPlannedUnselectedByLayerId, layerControl]) => {
    const gleis = layerControl.layers
      .filter((layer) => layer.isVisible)
      .flatMap((layer) => {
        return gleisPlannedUnselectedByLayerId[layer.id] || [];
      });
    return gleis.reduce((acc, gleisProps) => {
      return Object.assign(acc, { [gleisProps.id]: gleisProps });
    }, {});
  }
);

let bezetzInterval: NodeJS.Timeout = null;
let activeBezetzId: GleisPropsPlanned['id'] = null;
let prevBezetzId: GleisPropsPlanned['id'] = null;
let curPoint: Point | null = null;
let prevPoint: Point | null = null;

export function findAllConnectingGleisAtPoints(
  gleisz: Record<GleisPropsPlanned['id'], GleisPropsPlanned>,
  points: Point[],
  excludeId: GleisPropsPlanned['id']
) {
  console.log(
    'finding connected gleis for :',
    excludeId,
    gleisz[excludeId].type
  );
  return points
    .filter((p) => ['c1', 'c2'].includes(p.type))
    .map((point) => {
      return [point, findConnection(gleisz, point, excludeId)];
    })
    .filter(([id, gleis]) => {
      return !!gleis;
    });
}

tools.subscribe((tools) => {
  if (!tools.routeSimulation && !!bezetzInterval) {
    stopSimulation();
  }
});

type Combo = [Point, GleisPropsPlanned];

export function stopSimulation() {
  clearInterval(bezetzInterval);
  curPoint = null;
  prevPoint = null;
  activeBezetzId = null;
  prevBezetzId = null;
  bezetzInterval = null;
}

export function startRouteAt(startAtId: GleisPropsPlanned['id']) {
  const gleisz: Record<GleisPropsPlanned['id'], GleisPropsPlanned> =
    get(activeLayerGleisById);

  if (bezetzInterval) {
    stopSimulation();
  }

  if (gleisz) {
    activeBezetzId = startAtId;
    gleisBezetz.set({ [activeBezetzId]: [null, null, ''] });
  }

  bezetzInterval = setInterval(() => {
    if (!gleisz) {
      return;
    }
    const prevGleis = gleisz?.[prevBezetzId];
    const currentGleis = gleisz[activeBezetzId];
    const coordStringCurrentPoint = curPoint && getCoordString(curPoint);

    // Select connecting gleis not attached to the currentPoint.
    // Will result in first point of there is no current point.
    const connectingPoints = !!curPoint
      ? currentGleis.points.filter(
          (point) => getCoordString(point) !== coordStringCurrentPoint
        )
      : currentGleis.points;

    const connectedGleis = findAllConnectingGleisAtPoints(
      gleisz,
      connectingPoints,
      activeBezetzId
    );

    /** TODO: Where to go from here.
     * - Check if switches/engels are straigt/switched
     * - Check which crossing segment we should take
     * - Check which connecting gleis are available / reserved / closed etc.
     * - Check if there is a signal?
     *
     * for now: Check
     */
    let [combo] = connectedGleis;
    let gleisSegmentType;

    // Find the current gleis paths that are connected to the current point (can be multiple in case of switches).
    const curConnectingPaths = currentGleis.pathSegments.filter((path) => {
      const a = path?.points?.some(
        (pString) => pString === coordStringCurrentPoint
      );
      return !!a;
    });
    // Filter out the coordStringCurrentPoints.
    // All we have left now are possible starting points of conected gleis. In the case of curve, straight, crossing.
    // or non - branching points of turnouts we only have one point.
    // If there are more than 1 candidate points, we are at a turnout of some kind.
    ///////
    // Determine what to do.
    ///////
    // For example: check if connected blocks are reserved, occupied or can't be accessed (one-way), in repair or dead end.
    const connectingPathPointCandidates = curConnectingPaths.flatMap((path) => {
      return path.points.filter((pString) => {
        return pString !== coordStringCurrentPoint;
      });
    });

    let candidatePointString = connectingPathPointCandidates[0];

    switch (currentGleis.type) {
      case 'Curve':
      case 'Flex':
      case 'Straight':
        break;
      case 'Turnout':
        break;
      case 'TurnoutCurved':
        break;
      case 'ThreeWay':
        break;
      case 'Engels':
        break;
      case 'Crossing':
        break;
    }

    combo =
      connectedGleis.find(([id, gleisProps]: Combo) => {
        return gleisProps.points.some(
          (point) => candidatePointString === getCoordString(point)
        );
      }) || connectedGleis[0];
    console.log('combo:', combo, connectedGleis.length);

    if (combo) {
      let nextGleis: GleisPropsPlanned;
      prevPoint = curPoint;
      prevBezetzId = activeBezetzId;

      [curPoint, nextGleis] = combo as Combo;

      activeBezetzId = nextGleis.id;
      gleisBezetz.set({
        [activeBezetzId]: [curPoint, prevPoint, gleisSegmentType],
      });
    } else {
      stopSimulation();
      alert('Simulation stopped, cannot determine next gleis.');
    }
  }, 400);
}
