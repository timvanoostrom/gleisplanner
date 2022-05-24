import { generateID, jsonCopy } from '../helpers/app';
import { isWithinRadius } from '../helpers/geometry';
import { findSegment } from '../helpers/gleis';
import type {
  BezetzRoute,
  GleisLink,
  GleisPropsPlanned,
  LinkedRoute,
  Loco,
  LocoRoutes,
  PathSegmentProps,
  Point,
  Route,
} from '../types';
import { derived, get, writable } from 'svelte/store';
import SVGPathCommander from 'svg-path-commander';
import { svgPathProperties } from 'svg-path-properties';
import {
  getCoordString,
  gleisPlanned,
  pointConnections,
  setControlGleisIdsActive,
  setControlGleisIdsActive_,
} from './gleis';
import {
  activeLinkRegistry,
  blocksBySectionId,
  getBezetzSegment,
  gleisByBlockId,
} from './sections';
import { gleisBezetz, GLEIS_LOCO_ROUTES_DEFAULT } from './bezetz';

export const previewControlRoute = writable<string[]>([]);

export const activeRouteSegments = derived(gleisBezetz, (gleisBezetz) => {
  return Object.entries(gleisBezetz).flatMap(([locoID, gleisBezetz]) => {
    const activeRoute: BezetzRoute =
      gleisBezetz?.routes?.[gleisBezetz?.activeRouteId];
    return activeRoute?.activePathSegments ?? [];
  });
});

function findPointByCoordString(points: Point[], str: string) {
  return points.find((p) => getCoordString(p) === str);
}

function getOpposingPointStrings(
  pathSegments: PathSegmentProps[],
  currentGleis: GleisPropsPlanned,
  curPoint: string
): string[] {
  function getPoints(pathSegment: PathSegmentProps): string[] {
    const opposingpoints = pathSegment.points.filter((pointString) => {
      return pointString !== curPoint;
    });

    return opposingpoints.filter((pointString) => {
      const isPrimaryPoint = ['c1', 'c2'].includes(
        findPointByCoordString(currentGleis.points, pointString)?.type
      );

      const [x1, y1] = curPoint.split(',').map((s) => parseInt(s, 10));
      const [x2, y2] = pointString.split(',').map((s) => parseInt(s, 10));

      return (
        isPrimaryPoint &&
        !isWithinRadius({ x: x1, y: y1 }, { x: x2, y: y2 }, 100)
      );
    });
  }

  const points =
    pathSegments.flatMap((pathSegment) => {
      return getPoints(pathSegment);
    }) || [];

  return points;
}

function findRoutesToAvailableSection(
  gleisId: GleisPropsPlanned['id'],
  curPoint: string,
  routeGleisGleisLinks: LinkedRoute = [],
  routes: LinkedRoute[] = [],
  depth: number,
  destinationBlockID?: string,
  pointsCovered?: string[]
): LinkedRoute[] {
  const currentGleis: GleisPropsPlanned = get(gleisPlanned)[gleisId];

  // Take previous point/gleis
  const [, , fromPoint = '', fromGleis = null] =
    routeGleisGleisLinks[routeGleisGleisLinks.length - 1] || [];

  routeGleisGleisLinks.push([fromPoint, fromGleis, curPoint, currentGleis]);

  const mainSegments = currentGleis.pathSegments?.filter(
    (segment) =>
      (segment.type === 'main' || segment.type === 'branch') &&
      segment.points.includes(curPoint)
  );

  const opposingPointStrings = getOpposingPointStrings(
    mainSegments,
    currentGleis,
    curPoint
  );

  // console.log('opposingPointStrings', opposingPointStrings);

  if (!opposingPointStrings.length) {
    return [];
  }

  // Select all connected gleis
  const connectedGleis = opposingPointStrings.map((toPoint) => {
    // NOTE: Takes first found gleis but when we have multiple gleis in various layers
    // mounted at the same point, which do we taken? Maybe we should introduce an extra element
    // a sort-of-bridge-layer-connection-type
    const [toGleis]: GleisPropsPlanned[] = get(pointConnections)
      [toPoint]?.filter((id) => id !== gleisId)
      .map((id) => get(gleisPlanned)[id]);

    return [curPoint, currentGleis, toPoint, toGleis] as GleisLink;
  });

  if (!connectedGleis.length) {
    // dead end friends??
    console.log('dead endZZ at', currentGleis);
    return [];
  }

  const blockCandidateFilterPredicate = destinationBlockID
    ? ([fromPoint, fromGleis, toPoint, toGleis]) => {
        const hasSectionId = !!toGleis?.sectionId;

        if (!hasSectionId) {
          return false;
        }

        const blockId = get(blocksBySectionId)?.[toGleis.sectionId]?.id;
        return hasSectionId && blockId === destinationBlockID;
      }
    : ([fromPoint, fromGleis, toPoint, toGleis]) => {
        return (
          !!toGleis?.sectionId &&
          !get(blocksBySectionId)?.[toGleis.sectionId].occupied
        );
      };

  // Check if gleis are in blocks and are not occupied.
  let blockCandidates = connectedGleis.filter(blockCandidateFilterPredicate);

  // Candidates without section
  const connectionCandidates = connectedGleis.filter(
    ([fromPoint, fromGleis, toPoint, toGleis]) => {
      return (
        !!toGleis &&
        (!toGleis?.sectionId ||
          (!!toGleis?.sectionId &&
            get(blocksBySectionId)?.[toGleis.sectionId].id !==
              destinationBlockID))
      );
    }
  );

  for (const candidateGleisLink of blockCandidates) {
    // TODO: Push all gleisID's in this section (via getAllGleisIdsInSection(candidate.blockId))
    const [, , fromPoint, fromGleis] = candidateGleisLink;

    // Select opposite point of destination gleis
    const toPoint = fromGleis.pathSegments
      .find((p) => p.type === 'branch' || p.type === 'main')
      ?.points?.find((p) => p !== fromPoint);

    const candidateGleisEndpoint: GleisLink = [
      fromPoint,
      fromGleis,
      toPoint,
      null,
    ];

    routes.push([
      ...routeGleisGleisLinks,
      candidateGleisLink,
      candidateGleisEndpoint,
    ]);
  }

  for (const [fromPoint, fromGleis, toPoint, toGleis] of connectionCandidates) {
    let pointsCoveredCopy = [...pointsCovered];
    if (!pointsCovered.includes(fromPoint + toPoint)) {
      pointsCoveredCopy.push(fromPoint + toPoint);
    } else {
      continue;
    }

    findRoutesToAvailableSection(
      toGleis.id,
      toPoint,
      [...routeGleisGleisLinks],
      routes,
      depth + 1,
      destinationBlockID,
      pointsCoveredCopy
    );
  }

  return routes;
}

function findRoutes(
  fromId: GleisPropsPlanned['id'],
  pointPredicate: (
    pointString: string,
    index: number,
    allPoints: string[]
  ) => boolean,
  destinationBlockID?: string
) {
  const gleis = get(gleisPlanned)[fromId];
  const point = (
    gleis.pathSegments.find((s) => s.type === 'main')?.points || []
  ).find(pointPredicate);

  let routes = [];

  if (point) {
    routes = findRoutesToAvailableSection(
      gleis.id,
      point,
      [],
      [],
      0,
      destinationBlockID,
      []
    );
  }

  return routes;
}

function determineEndPointAt(loco: Loco, segment: string) {
  const path = new svgPathProperties(segment);
  const pathLength = path.getTotalLength();
  const locoLength = loco.length ?? 0;
  const margin = (pathLength - locoLength) / 2;
  return path.getPointAtLength(pathLength - margin);
}

function getPathLinks(gleisLinks: GleisLink[]) {
  let path = '';
  let length = 0;

  const linksOrdered = [];
  const linkedList = [];

  for (const link of gleisLinks) {
    const [fromPoint, from, toPoint, to] = link;
    if (!fromPoint || !toPoint) {
      continue;
    }
    linkedList.push([
      fromPoint,
      toPoint,
      findSegment(from, fromPoint, toPoint),
    ]);
  }

  for (const link of linkedList) {
    let [fromPoint, toPoint, segment] = link;
    const sp = new svgPathProperties(segment);

    const [{ start }] = sp.getParts().filter((p) => p.length >= 1);

    if (fromPoint !== getCoordString(start)) {
      const path = new SVGPathCommander(segment, {});
      (path as any).reverse();
      segment = path.toString();
    }

    length += sp.getTotalLength();
    path += segment;
  }

  return { path, length, segments: linkedList };
}

export function getPointAtDepartureBlock(departureBlockID: string) {
  // console.log(departureBlockID, $gleisByBlockId?.[departureBlockID]);
  const blockPath = get(gleisByBlockId)
    ?.[departureBlockID]?.map(
      (gleis) =>
        gleis.pathSegments
          .find((segment) => segment.type === 'main')
          ?.d.toString() || ''
    )
    .join('');

  const pathProps = new svgPathProperties(blockPath);
  const atPoint = pathProps.getPointAtLength(pathProps.getTotalLength() / 2);

  return atPoint;
}

export function generateRoutes(
  loco: Loco,
  departureBlockID: string,
  destinationBlockID?: string
) {
  setControlGleisIdsActive_([]);

  const departureGleisID = get(gleisByBlockId)?.[departureBlockID]?.[0]?.id;

  const routes1 = findRoutes(
    departureGleisID,
    (pointString, index) => index === 0,
    destinationBlockID
  );

  const routes2 = findRoutes(
    departureGleisID,
    (pointString, index) => index === 1,
    destinationBlockID
  );

  const routes: LinkedRoute[] = [...routes1, ...routes2];

  if (!routes.length) {
    alert('Cannot generate route, no route to destination section found.');
  } else {
    const routesGenerated = {};

    for (const routeLinks of routes) {
      const pathLinks = getPathLinks(routeLinks);

      const route: Route = {
        id: generateID(),
        links: routeLinks,
        path: pathLinks?.path,
        length: pathLinks?.length,
      };

      const lastSegment = pathLinks.segments[pathLinks.segments.length - 1][2];

      routesGenerated[route.id] = {
        route,
        activeLinkIndex: 0,
        activePathSegments: [],

        // TODO: endAtPoint could be determined by a signal or generated based on train length / type / user input etc.
        endAtPoint: determineEndPointAt(loco, lastSegment),
      };
    }

    gleisBezetz.update((bezetzUpdated) => {
      const l = bezetzUpdated[loco.id] || jsonCopy(GLEIS_LOCO_ROUTES_DEFAULT);
      return {
        ...bezetzUpdated,
        [loco.id]: {
          ...l,
          routes: routesGenerated,
          activeRouteId: Object.keys(routesGenerated)[0] ?? '',
        },
      };
    });
  }
}

export function resetPreview() {
  previewControlRoute.set([]);
}

export function previewRoute(locoID: string, routeID: string) {
  setControlGleisIdsActive([]);

  const links = getActiveRoute(locoID).route.links;
  const segments = [];

  links.forEach((link, index) => {
    segments.push(getBezetzSegment(index, links));
  });

  previewControlRoute.set(segments);
  // setControlGleisIdsActive(ids);
}

export function reverseRouteDestination(locoID: string) {
  gleisBezetz.update((gleisBezetz) => {
    const a = gleisBezetz[locoID];
    const { departureBlockID = '', destinationBlockID = '' } = a;
    a.destinationBlockID = departureBlockID;
    a.departureBlockID = destinationBlockID;
    return gleisBezetz;
  });
}

export function getLocoRoutes(locoID: Loco['id']): LocoRoutes {
  return get(gleisBezetz)?.[locoID];
}

export function getActiveRoute(locoID: Loco['id']) {
  const locoRoutes = getLocoRoutes(locoID);
  const bezetzRoute = locoRoutes?.routes[locoRoutes?.activeRouteId];
  return bezetzRoute ?? null;
}

export function resetRoutes(locoID: string) {
  gleisBezetz.update((gleisBezetz) => {
    gleisBezetz[locoID] = jsonCopy(GLEIS_LOCO_ROUTES_DEFAULT);
    return gleisBezetz;
  });
}

export function clearRouteDestination(locoID: string) {
  gleisBezetz.update((gleisBezetz) => {
    gleisBezetz[locoID].destinationBlockID = '';
    gleisBezetz[locoID].activeRouteId = '';
    gleisBezetz[locoID].routes = {};
    return gleisBezetz;
  });
}

export function setActiveRouteId(locoID: string, routeID: string) {
  gleisBezetz.update((gleisBezetz) => {
    gleisBezetz[locoID].routes[routeID].activeLinkIndex = 0;
    gleisBezetz[locoID].routes[routeID].activePathSegments = [];
    gleisBezetz[locoID].activeRouteId = routeID;
    return gleisBezetz;
  });
}

export function getCurrentGleisId(locoID: Loco['id']) {
  const activeRoute = getActiveRoute(locoID);

  if (!activeRoute) {
    return null;
  }

  const activeLink = activeRoute.route.links[activeRoute.activeLinkIndex];
  const currentID = activeLink?.[3]?.id ?? null;

  return currentID;
}

export function getNextGleisId(locoID: Loco['id']) {
  const activeRoute = getActiveRoute(locoID);

  if (!activeRoute) {
    return null;
  }

  const nextActiveLink =
    activeRoute.route.links[activeRoute.activeLinkIndex + 1];
  const nextID = nextActiveLink?.[3]?.id ?? null;

  return nextID;
}

export function isArrivedAtDestination(locoID: string, point: Point) {
  const activeRoute = getActiveRoute(locoID);
  const { endAtPoint } = activeRoute;
  return point.x === endAtPoint.x && point.y === endAtPoint.y;
}

export function hasNextSegment(locoID: string) {
  const gleisID = getNextGleisId(locoID);
  return gleisID !== null;
}

export function isNextSegmentOccupied(locoID: string) {
  const gleisID = getNextGleisId(locoID);
  if (gleisID) {
    return Object.entries(get(activeLinkRegistry)).some(
      ([locoID, { currentID }]) => currentID === gleisID
    );
  }
  return true;
}

export function isNextSegmentAvailable(locoID: string) {
  return !isNextSegmentOccupied(locoID);
}
