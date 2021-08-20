import type { PathSegmentProps, Point, ProtoSegmentStraight } from '../types';
import { calculateStraightPoints, generateStraightPaths } from './straight';
import { A180 } from '../config/constants';
import { toDeg } from './geometry';
import { sortPaths } from './gleis';

export interface CalculateCrossingPointsProps {
  pointOrigin: Point;
  protos: ProtoSegmentStraight[];
  connectingPointOrigin?: Point;
  variant?: 's1' | 's2' | string;
}

export function calculateCrossingPoints({
  pointOrigin,
  protos,
  connectingPointOrigin,
  variant,
}: CalculateCrossingPointsProps): Point[] {
  let [proto1, proto2] = protos;

  if (variant === 's2') {
    proto2 = { ...proto2, angle: -proto2.angle };
  } else {
    pointOrigin = connectingPointOrigin;
  }
  _l(
    'blap',
    variant,
    pointOrigin.direction,
    toDeg(pointOrigin.connectAngle + A180 * pointOrigin.direction)
  );

  const [st1, st2, stlbl1] = calculateStraightPoints(
    pointOrigin,
    proto1,
    connectingPointOrigin
  );

  const [st3, st4, stlbl2] = calculateStraightPoints(
    pointOrigin,
    proto2,
    connectingPointOrigin
  );

  return [
    st1,
    st2,
    st3,
    st4,
    stlbl2,
    { ...connectingPointOrigin, type: 'po-s1' },
  ];
}

export function generateCrossingPaths(
  points: Point[],
  protos: ProtoSegmentStraight[]
): PathSegmentProps[] {
  const [proto1, proto2] = protos;
  const [st1, st2, st3, st4, stlbl2] = points;
  const paths1 = generateStraightPaths([st1, st2], proto1);
  const paths2 = generateStraightPaths([st3, st4], proto2);

  return sortPaths(paths1, paths2);
}
