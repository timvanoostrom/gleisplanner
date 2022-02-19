import type { PathSegmentProps, Point, ProtoSegmentStraight } from '../types';
import { calculateAngle, cAngle, getCentroid, toDeg, toRad } from './geometry';
import { sortPaths } from './gleis';
import { generateStraightPaths } from './straight';
import * as d3 from 'd3-path';
import {
  A90,
  GLEIS_WIDTH,
  GLEIS_WIDTH_WB,
  A180,
  A360,
} from '../config/constants';
import { calculateCrossingPoints } from './crossing';

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

  const curvePrimaryPath = paths1.find((path) => path.type === 'main');
  if (curvePrimaryPath) {
    curvePrimaryPath.gleisType = 'Branch1';
  }

  const curveSecondaryPath = paths2.find((path) => path.type === 'main');
  if (curveSecondaryPath) {
    curveSecondaryPath.gleisType = 'Branch2';
  }

  return sortPaths(paths1, paths2);
}
