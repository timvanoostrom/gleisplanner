import type { PathSegmentProps, Point } from '../types';
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
