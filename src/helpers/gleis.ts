import type { GleisPropsPlanned, PathSegmentProps, Point } from '../types';
import { getCoordString, pointConnections } from '../store/gleis';
import { get } from 'svelte/store';

export function sortPaths(
  ...paths: Array<PathSegmentProps[]>
): PathSegmentProps[] {
  // Group the path types together so they won't lay above one another.
  const pathsMapped = new Map();

  for (const path of paths.flat()) {
    if (!pathsMapped.has(path.type)) {
      pathsMapped.set(path.type, [path]);
    } else {
      pathsMapped.get(path.type).push(path);
    }
  }

  return Array.from(pathsMapped.values()).flatMap((paths) => paths);
}

export function isFullyConnected(point: Point) {
  const points = get(pointConnections)[getCoordString(point)];
  // TODO: must be based on type. TUrnouts have at least 3, crossing 4 etc.
  return points?.length >= 2;
}

export function getConnectedPoint(point: Point) {
  return get(pointConnections)[getCoordString(point)];
}

export function getConnectedPoints(points: Point[]) {
  return points.flatMap(getConnectedPoint);
}

export function isPointOccupied(point: Point) {
  const points = get(pointConnections)[getCoordString(point)];
  return points?.length >= 1;
}

export function findSegment(
  from: GleisPropsPlanned,
  fromPoint: string,
  toPoint: string
) {
  const segment =
    from.pathSegments
      ?.filter(
        (pathSegment) =>
          (pathSegment.type === 'main' || pathSegment.type === 'branch') &&
          !!pathSegment.points?.length
      )
      ?.find((pathSegment) => {
        const isEndOfRoute = !toPoint && pathSegment.points.includes(fromPoint);

        const isConnectingSegment =
          pathSegment.points.includes(fromPoint) &&
          pathSegment.points.includes(toPoint);

        return isConnectingSegment || isEndOfRoute;
      })
      ?.d.toString() || '';

  return segment;
}

export function convertToPoint(p: string) {
  return p.split(',').reduce(
    (acc, p, index) => {
      if (index === 0) {
        acc.x = parseFloat(p);
      } else {
        acc.y = parseFloat(p);
      }
      return acc;
    },
    { x: 0, y: 0 }
  );
}
