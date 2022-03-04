import * as d3 from 'd3-path';
import { getCoordString } from '../store/gleis';
import { A90, GLEIS_WIDTH } from '../config/constants';
import type { PathSegmentProps, Point, ProtoSegmentStraight } from '../types';
import { calculateCrossingPoints } from './crossing';
import { cAngle, toRad } from './geometry';
import { sortPaths } from './gleis';
import { generateStraightPaths } from './straight';

export interface CalculateEngelsPointsProps {
  pointOrigin: Point;
  protos: ProtoSegmentStraight[];
  connectingPointOrigin?: Point;
  variant?: 's1' | 's2' | 's3' | 's4' | string;
  doubleSlip: boolean;
}

export function calculateEngelsPoints({
  pointOrigin,
  protos,
  connectingPointOrigin,
  variant,
  doubleSlip = false,
}: CalculateEngelsPointsProps): Point[] {
  const points = calculateCrossingPoints({
    pointOrigin,
    protos,
    connectingPointOrigin,
    variant: variant === 's2' || variant === 's4' ? 's2' : 's1',
  });

  const [p1, p2, p3, p4, lbl] = points;
  const pp = [...points];

  const spreadAngle1 = toRad(cAngle(p1.x, p1.y, p2.x, p2.y));
  const spreadAngle2 = toRad(cAngle(p3.x, p3.y, p4.x, p4.y));

  const pAngle =
    (variant === 's2' || variant === 's4' ? spreadAngle2 : spreadAngle1) +
    protos[1].angle / 2;

  const dist = GLEIS_WIDTH * 1.5;
  const spreadX = dist * Math.cos(pAngle + A90);
  const spreadY = dist * Math.sin(pAngle + A90);

  const ax1 = lbl.x + spreadX;
  const ay1 = lbl.y + spreadY;

  let addPoint: Point = {
    x: ax1,
    y: ay1,
    type: 'add',
  };

  if (variant === 's3' || variant === 's4') {
    addPoint.x = lbl.x + spreadX * -1;
    addPoint.y = lbl.y + spreadY * -1;
  }

  pp.push(addPoint);

  if (doubleSlip) {
    const ax2 = lbl.x + spreadX * -1;
    const ay2 = lbl.y + spreadY * -1;

    pp.push({
      x: ax2,
      y: ay2,
      type: 'add',
    });
  }

  return pp;
}

export function generateEngelsPaths(
  points: Point[],
  protos: ProtoSegmentStraight[]
): PathSegmentProps[] {
  const [proto1, proto2] = protos;
  const [st1, st2, st3, st4] = points;

  const paths1 = generateStraightPaths([st1, st2], proto1);
  const paths2 = generateStraightPaths([st3, st4], proto2);

  const engelsPrimaryPath = paths1.find((path) => path.type === 'main');
  if (engelsPrimaryPath) {
    engelsPrimaryPath.gleisType = 'Straight';
  }

  const engelsSecondaryPath = paths2.find((path) => path.type === 'main');
  if (engelsSecondaryPath) {
    engelsSecondaryPath.gleisType = 'Straight2';
  }

  const paths3: PathSegmentProps[] = [];
  {
    const mainPath = d3.path();

    mainPath.moveTo(st1.x, st1.y);
    const intersection = lineIntersection(
      st1.x,
      st1.y,
      st2.x,
      st2.y,
      st3.x,
      st3.y,
      st4.x,
      st4.y
    );
    if (intersection) {
      mainPath.lineTo(intersection.x, intersection.y);
    }
    mainPath.lineTo(st4.x, st4.y);

    paths3.push({
      d: mainPath.toString(),
      type: 'branch',
      gleisType: 'Curve',
      points: [getCoordString(st1), getCoordString(st4)],
    });
  }
  {
    const mainPath = d3.path();

    mainPath.moveTo(st2.x, st2.y);
    const intersection = lineIntersection(
      st1.x,
      st1.y,
      st2.x,
      st2.y,
      st3.x,
      st3.y,
      st4.x,
      st4.y
    );
    if (intersection) {
      mainPath.lineTo(intersection.x, intersection.y);
    }
    mainPath.lineTo(st3.x, st3.y);

    paths3.push({
      d: mainPath.toString(),
      type: 'branch',
      gleisType: 'Curve2',
      points: [getCoordString(st2), getCoordString(st3)],
    });
  }

  return sortPaths(paths1, paths2, paths3);
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false;
  }

  let denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  // Lines are parallel
  if (denominator === 0) {
    return false;
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false;
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1);
  let y = y1 + ua * (y2 - y1);

  return { x, y };
}
