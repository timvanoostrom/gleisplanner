import * as d3 from 'd3-path';
import { A180, A90, GLEIS_WIDTH, GLEIS_WIDTH_WB } from '../config/constants';
import type { PathSegmentProps, Point, ProtoSegmentStraight } from '../types';
import { Direction } from '../types';
import { cAngle, rotate, toRad, getMidPoint, toDeg } from './geometry';

export function calculateStraightPoints(
  pointOrigin: Point,
  proto: ProtoSegmentStraight,
  connectingPoint?: Point
): Point[] {
  let { connectAngle = 0, x = 450, y = 250, direction } = pointOrigin;
  const isRoot = pointOrigin.root === true;
  const calcAngle = connectAngle + A90;

  let x1 = x;
  let y1 = y;

  direction =
    direction || (pointOrigin.type === 'c1' ? Direction.L : Direction.R);

  let x2 = x1 + Math.cos(calcAngle) * proto.length * direction;
  let y2 = y1 + Math.sin(calcAngle) * proto.length * direction;
  let straightCenter = getMidPoint(x1, y1, x2, y2);

  const angle = proto.angle || 0;

  connectAngle += angle;

  if (angle) {
    const radius = proto.length / 2;
    const cx = x1 + Math.cos(calcAngle) * radius * direction;
    const cy = y1 + Math.sin(calcAngle) * radius * direction;

    {
      const { x, y } = rotate(cx, cy, x1, y1, -angle);
      x1 = x;
      y1 = y;
    }

    {
      const { x, y } = rotate(cx, cy, x2, y2, -angle);
      x2 = x;
      y2 = y;
    }

    straightCenter = {
      x: cx,
      y: cy,
    };
  }

  const point1: Point = {
    x: x1,
    y: y1,
    type: 'c1',
    // TODO: If detached, reset direction
    direction: isRoot
      ? Direction.L
      : direction === Direction.L
      ? Direction.R
      : Direction.L,
    connectAngle,
  };
  const point2: Point = {
    x: x2,
    y: y2,
    type: 'c2',
    direction,
    connectAngle,
  };

  if (connectingPoint?.type === 'c1') {
    point1.type = 'c2';
    point2.type = 'c1';
  }

  return [
    point1,
    point2,
    {
      x: straightCenter.x,
      y: straightCenter.y,
      connectAngle: connectAngle,
      type: 'lbl',
    },
  ];
}

interface StraightPathProps {
  path: d3.Path;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  spreadX: number;
  spreadY: number;
}

export function addStraightPathTo({
  path,
  x1,
  y1,
  x2,
  y2,
  spreadX,
  spreadY,
}: StraightPathProps) {
  // left-top
  const x4B = x1 - spreadX;
  const y4B = y1 - spreadY;

  // right-top
  const x5B = x2 - spreadX;
  const y5B = y2 - spreadY;

  // right-bottom
  const x6B = x2 + spreadX;
  const y6B = y2 + spreadY;

  // left-bottom
  const x7B = x1 + spreadX;
  const y7B = y1 + spreadY;

  path.moveTo(x6B, y6B);
  path.lineTo(x7B, y7B);
  path.lineTo(x4B, y4B);
  path.lineTo(x5B, y5B);
  path.lineTo(x6B, y6B);
}

export function generateStraightPaths(
  points: Point[],
  proto: ProtoSegmentStraight
): PathSegmentProps[] {
  const [{ x: x1, y: y1, type: t1 }, { x: x2, y: y2 }] = points;
  const spreadAngle = toRad(cAngle(x1, y1, x2, y2));
  const mainPath = d3.path();

  mainPath.moveTo(x1, y1);
  mainPath.lineTo(x2, y2);

  const spread = GLEIS_WIDTH / 2;
  const spreadB = GLEIS_WIDTH_WB / 2;

  const spreadX = spread * Math.cos(spreadAngle - A90);
  const spreadY = spread * Math.sin(spreadAngle - A90);

  const spreadXB = spreadB * Math.cos(spreadAngle - A90);
  const spreadYB = spreadB * Math.sin(spreadAngle - A90);

  // left-top
  let x4 = x1 - spreadX;
  let y4 = y1 - spreadY;

  // right-top
  let x5 = x2 - spreadX;
  let y5 = y2 - spreadY;

  // right-bottom
  let x6 = x2 + spreadX;
  let y6 = y2 + spreadY;

  // left-bottom
  let x7 = x1 + spreadX;
  let y7 = y1 + spreadY;

  const p1 = d3.path();
  p1.moveTo(x4, y4);
  p1.lineTo(x5, y5);

  const p2 = d3.path();
  p2.moveTo(x7, y7);
  p2.lineTo(x6, y6);

  const outerPath = d3.path();
  addStraightPathTo({
    path: outerPath,
    x1,
    y1,
    x2,
    y2,
    spreadX: spreadXB,
    spreadY: spreadYB,
  });

  const path1: PathSegmentProps = {
    d: p1,
    type: 'p1',
  };

  const path2: PathSegmentProps = {
    d: p2,
    type: 'p2',
  };

  if (t1 === 'c2') {
    path1.type = 'p2';
    path2.type = 'p1';
  }

  const paths: PathSegmentProps[] = [
    { d: outerPath, type: 'outer' },
    { d: mainPath, type: 'main' },
    path1,
    path2,
  ];

  return paths;
}
