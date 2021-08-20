import type { PathSegmentProps, Point, ProtoTurnoutSegments } from '../types';

export interface CalculateThreeWayPointsProps {
  pointOrigin: Point;
  protos: ProtoTurnoutSegments;
  connectingPointOrigin?: Point;
  variant?: 's1' | 's2' | 'c1' | 'c2' | string;
}

export function calculateThreeWayPoints({
  pointOrigin,
  protos,
  connectingPointOrigin,
  variant,
}: CalculateThreeWayPointsProps): Point[] {
  return [];
}

export function generateThreeWayPaths(
  points: Point[],
  protos: ProtoTurnoutSegments
): PathSegmentProps[] {
  return [];
}
