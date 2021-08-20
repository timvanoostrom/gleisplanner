import { A180, A90 } from '../config/constants';
import type {
  PathSegmentProps,
  Point,
  ProtoSegmentCurve,
  ProtoSegmentStraight,
  ProtoTurnoutSegments,
} from '../types';
import { calculateCurvePoints, generateCurvePaths } from './curve';
import { getTriangleCentroid, normalizeAngle, toDeg } from './geometry';
import { sortPaths } from './gleis';
import { calculateStraightPoints, generateStraightPaths } from './straight';

export interface CalculateTurnoutPointsProps {
  pointOrigin: Point;
  protos: ProtoTurnoutSegments;
  connectingPointOrigin?: Point;
  variant?: 's1' | 's2' | 'c1' | string;
}
export function calculateTurnoutPoints({
  pointOrigin,
  protos,
  connectingPointOrigin,
  variant,
}: CalculateTurnoutPointsProps): Point[] {
  let straightPointOrigin: Point = pointOrigin;

  const protoSegmentCurve = protos.find(
    (proto) => proto.type === 'Curve'
  ) as ProtoSegmentCurve;

  let directionOfCurve = protoSegmentCurve.direction;
  let curveConnectAngle =
    pointOrigin.direction === directionOfCurve
      ? pointOrigin.connectAngle
      : pointOrigin.connectAngle + A180;

  if (variant === 'c1') {
    curveConnectAngle =
      pointOrigin.direction !== directionOfCurve
        ? pointOrigin.connectAngle
        : pointOrigin.connectAngle + A180;
    directionOfCurve = directionOfCurve * -1;
  }

  const curvePointOrigin: Point = {
    x: pointOrigin.x,
    y: pointOrigin.y,
    connectAngle: curveConnectAngle,
    direction: directionOfCurve,
    type: 'c1',
  };

  const curvePoints = calculateCurvePoints({
    pointOrigin: curvePointOrigin,
    proto: protoSegmentCurve,
    connectingPointOrigin,
  });

  const protoSegmentStraight = protos.find(
    (proto) => proto.type === 'Straight'
  ) as ProtoSegmentStraight;

  if (variant === 'c1') {
    straightPointOrigin = {
      ...curvePoints[1],
      direction: curvePoints[1].direction * -1,
    };
  }

  const straightPoints = calculateStraightPoints(
    straightPointOrigin,
    protoSegmentStraight,
    connectingPointOrigin
  );

  const po = connectingPointOrigin || pointOrigin;
  const poType = !po.type || po.type.endsWith('c2') ? 'po-c2' : 'po-c1';
  const segmentPoints = [...straightPoints, ...curvePoints];
  const [st1, st2, stlbl, cu1, cu2, cc, culbl] = segmentPoints;
  const points: Point[] = [cu1, st2, cu2, cc, stlbl, { ...po, type: poType }];

  if (variant === 's2') {
    // Simple flip on straight point
    const pointOrigin = { ...st2, direction: st2.direction * -1 };
    const points = calculateTurnoutPoints({
      pointOrigin,
      protos,
      connectingPointOrigin,
    });
    if (poType === 'po-c2') {
      points[0].type = 'c2';
      points[1].type = 'c1';
      points[2].type = 'c1';
    } else if (poType === 'po-c1') {
      points[0].type = 'c1';
      points[1].type = 'c1';
      points[2].type = 'c2';
    }
    return points;
  } else if (variant === 'c1') {
    if (poType === 'po-c2') {
      cu2.type = 'c2';
      cu1.type = 'c1';
      st2.type = 'c1';
    } else if (poType === 'po-c1') {
      cu2.type = 'c1';
      cu1.type = 'c2';
      st2.type = 'c2';
    }

    if (protoSegmentCurve.length1) {
      // Adjust the curve center point because the path will be drawn based on the CurveEnd point instead of the Start point.
      cc.x =
        cc.x +
        Math.cos(cu2.connectAngle - A90 * cu2.direction) *
          protoSegmentCurve.length1;
      cc.y =
        cc.y +
        Math.sin(cu2.connectAngle - A90 * cu2.direction) *
          protoSegmentCurve.length1;
    }

    return [cu2, st2, cu1, cc, stlbl, { ...po, type: poType }];
  }

  if (poType === 'po-c1') {
    points[0].type = 'c2';
    points[1].type = 'c1';
    points[2].type = 'c1';
  }

  return points;
}

export function generateTurnoutPaths(
  points: Point[],
  protos: ProtoTurnoutSegments
): PathSegmentProps[] {
  const protoSegmentStraight = protos.find(
    (proto) => proto.type === 'Straight'
  ) as ProtoSegmentStraight;
  const protoSegmentCurve = protos.find(
    (proto) => proto.type === 'Curve'
  ) as ProtoSegmentCurve;

  const [cu1, st2, cu2, cc] = points;

  const straightPaths = generateStraightPaths([cu1, st2], protoSegmentStraight);
  const curvePaths = generateCurvePaths([cu1, cu2, cc], protoSegmentCurve);

  return sortPaths(straightPaths, curvePaths);
}
