import { A180, A90 } from '../config/constants';
import type {
  PathSegmentProps,
  Point,
  ProtoSegmentCurve,
  ProtoSegmentStraight,
} from '../types';
import { calculateCurvePoints, generateCurvePaths } from './curve';
import { normalizeAngle, toDeg } from './geometry';
import { sortPaths } from './gleis';
import { generateStraightPaths } from './straight';

interface CalculatePointOriginProps {
  pointOrigin: Point;
  proto: ProtoSegmentCurve;
  variant?: string;
}

function calculatePointOrigin({
  pointOrigin,
  proto,
  variant,
}: CalculatePointOriginProps): Point {
  const d = pointOrigin.direction;
  const curveOrigin: Point = {
    ...pointOrigin,
  };

  if (d === proto.direction) {
    curveOrigin.connectAngle = normalizeAngle(
      pointOrigin.connectAngle + A180 * -1
    );
    curveOrigin.direction = d * -1;
  } else if (proto.direction === -1 && d === 1) {
    curveOrigin.direction = 1;
    // curveOrigin.connectAngle = normalizeAngle(pointOrigin.connectAngle - A180);
  }

  const protoSegment: ProtoSegmentCurve = {
    ...proto,
    direction: proto.direction * -1,
  };
  delete protoSegment.length1;

  if (variant === 'c2') {
    protoSegment.length2 = proto.length1;
  }

  const [c1, c2] = calculateCurvePoints({
    pointOrigin: curveOrigin,
    proto: protoSegment,
  });
  //   _l('otherCurvePoints', otherCurvePoints, toDeg(curveOrigin.connectAngle));
  const point: Point = {
    ...c2,
    direction: d,
  };

  if (d === -1 && proto.direction === 1) {
    point.connectAngle = c2.connectAngle + A180;
  }
  if (d === 1 && proto.direction === -1) {
    point.connectAngle = c2.connectAngle - A180;
  }
  if (d === -1 && proto.direction === -1) {
    // point.connectAngle = c2.connectAngle + A180;
  }
  _l('blap', d, proto.direction);

  return point;
}

export interface CalculateTurnoutCurvedPointsProps {
  pointOrigin: Point;
  protos: ProtoSegmentCurve[];
  connectingPointOrigin?: Point;
  variant?: 'c1' | 'c2' | 'c3' | string;
}
export function calculateTurnoutCurvedPoints({
  pointOrigin,
  protos,
  connectingPointOrigin,
  variant,
}: CalculateTurnoutCurvedPointsProps): Point[] {
  const [protoSegmentCurve, protoSegmentCurve2] = protos;

  let directionOfCurve = protoSegmentCurve.direction;

  if (variant && variant !== 'c1') {
    pointOrigin = calculatePointOrigin({
      pointOrigin,
      proto: protoSegmentCurve,
      variant,
    });
  }

  let curveConnectAngle =
    pointOrigin.direction === directionOfCurve
      ? pointOrigin.connectAngle
      : pointOrigin.connectAngle + A180;

  let curvePointOrigin: Point = {
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

  const curvePoints2 = calculateCurvePoints({
    pointOrigin: curvePointOrigin,
    proto: protoSegmentCurve2,
    connectingPointOrigin,
  });

  const po = connectingPointOrigin || pointOrigin;
  const poType = !po.type || po.type.endsWith('c2') ? 'po-c2' : 'po-c1';
  const segmentPoints = [...curvePoints, ...curvePoints2];
  const [cu1, cu2, cc1, culbl1, cu3, cu4, cc2, culbl2] = segmentPoints;
  const points: Point[] = [
    cu1,
    cu2,
    cu4,
    cc1,
    cc2,
    culbl1,
    { ...po, type: poType },
  ];

  _l('potype', poType, variant);

  if (variant && variant !== 'c1') {
    if (poType === 'po-c1') {
      points[0].type = 'c1';
      points[1].type = 'c2';
      points[2].type = 'c2';
    } else {
      points[0].type = 'c2';
      points[1].type = 'c1';
      points[2].type = 'c1';
    }
  } else if (poType === 'po-c1') {
    points[0].type = 'c2';
    points[1].type = 'c1';
    points[2].type = 'c1';
  }

  return points;
}

export function generateTurnoutCurvedPaths(
  points: Point[],
  protos: ProtoSegmentCurve[]
): PathSegmentProps[] {
  const [protoSegmentCurve, protoSegmentCurve2] = protos;

  if (points.length === 4) {
    return generateCurvePaths(points, protoSegmentCurve);
  }

  const [cu1, cu2, cu3, cc1, cc2] = points;

  const curvePaths = generateCurvePaths([cu1, cu2, cc1], protoSegmentCurve);
  const curvePaths2 = generateCurvePaths([cu1, cu3, cc2], protoSegmentCurve2);
  // TODO: Add specific gleisType to the curve paths. E.g primary, secondary? Or straight, branched..
  const curveSecondaryPath = curvePaths2.find((path) => path.type === 'main');

  if (curveSecondaryPath) {
    curveSecondaryPath.gleisType = 'Curve2';
  }

  const straightPaths = generateStraightPaths(
    [
      cu1,
      {
        x:
          cu1.x +
          Math.cos(cu1.connectAngle + A90) *
            protoSegmentCurve.length1 *
            protoSegmentCurve.direction,
        y:
          cu1.y +
          Math.sin(cu1.connectAngle + A90) *
            protoSegmentCurve.length1 *
            protoSegmentCurve.direction,
      },
    ],
    protoSegmentCurve2 as unknown as ProtoSegmentStraight
  );

  return sortPaths(straightPaths, curvePaths, curvePaths2);
}
