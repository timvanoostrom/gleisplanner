import { Bezier } from 'bezier-js';
import * as d3 from 'd3-path';
import { get, writable } from 'svelte/store';
import { svgPathProperties } from 'svg-path-properties';
import { A180, A90, GLEIS_WIDTH, GLEIS_WIDTH_WB } from '../config/constants';
import { cAngle, normalizeAngle, toRad } from '../helpers/geometry';
import { connectGleis } from '../store/gleis';
import {
  Direction,
  FlexPoints,
  PathSegmentProps,
  Point,
  ProtoSegmentFlex,
  ProtoSegmentStraight,
} from '../types';
import { range } from './app';
import { getMidPoint, rotate } from './geometry';
import { addStraightPathTo, generateStraightPaths } from './straight';

export const connectFlexPointStart = writable<Point>(null);

export function connectFlex(
  pointOrigin: Point,
  protoSegment: ProtoSegmentFlex
) {
  console.log('sss', pointOrigin);
  const flexPoints = calculateFlexPoints({
    pointOrigin,
    proto: protoSegment,
    finalize: true,
  });
  connectGleis({
    pointOrigin: flexPoints[0],
    flexPoints,
  });
  connectFlexPointStart.set(null);
}

interface calculateFlexPointsProps {
  pointOrigin: Point;
  useMaxLength?: boolean;
  proto: ProtoSegmentFlex;
  finalize?: boolean;
}
export function calculateFlexPoints({
  pointOrigin,
  useMaxLength = false,
  proto,
  finalize = false,
}: calculateFlexPointsProps): Point[] {
  const connectStart: Point = get(connectFlexPointStart);

  if (connectStart) {
    const connectEnd = {
      ...pointOrigin,
      // direction: connectStart.direction === 1 ? -1 : 1,
    };

    const len = Math.hypot(
      pointOrigin.x - connectStart.x,
      pointOrigin.y - connectStart.y
    );

    let dir1 = 1;
    let dir2 = 1;

    let pointsAngle = normalizeAngle(
      toRad(cAngle(connectStart.x, connectStart.y, connectEnd.x, connectEnd.y))
    );

    let calcStartAngle = pointsAngle;
    let calcEndAngle = pointsAngle - A180;

    const isMovingUp = connectStart.y > pointOrigin.y;
    const isMovingDown = !isMovingUp;
    const isMovingRight = connectStart.x < pointOrigin.x;
    const isMovingLeft = !isMovingRight;

    const isNW = isMovingUp && isMovingLeft;
    const isNE = isMovingUp && isMovingRight;
    const isSW = isMovingDown && isMovingLeft;
    const isSE = isMovingDown && isMovingRight;

    if (useMaxLength) {
      const xMax = connectStart.x + Math.cos(pointsAngle) * proto.length;
      const yMax = connectStart.y + Math.sin(pointsAngle) * proto.length;

      if (connectEnd.x > xMax) {
        connectEnd.x = xMax;
      }
      if (connectEnd.y > yMax) {
        connectEnd.y = yMax;
      }
    }

    // With connect start angle
    if (connectStart.connectAngle !== -1 && connectEnd.connectAngle === -1) {
      const a = connectStart.connectAngle - (pointsAngle - A90);

      calcStartAngle = connectStart.connectAngle + A90 * connectStart.direction;

      calcEndAngle =
        connectStart.connectAngle -
        a * 2 +
        (A180 + A90 * connectStart.direction);
    }

    // With connect end angle
    if (connectStart.connectAngle === -1 && connectEnd.connectAngle !== -1) {
      calcEndAngle = connectEnd.connectAngle + A90 * connectEnd.direction;
    }

    // With connect start + connect end angle
    if (connectStart.connectAngle !== -1 && connectEnd.connectAngle !== -1) {
      calcStartAngle = connectStart.connectAngle + A90 * connectStart.direction;
      calcEndAngle = connectEnd.connectAngle + A90 * connectEnd.direction;
    }

    let connectAngle1 = calcStartAngle - A90;
    let connectAngle2 = calcEndAngle + A90 * connectStart.direction;

    const cpCos1 = (Math.cos(calcStartAngle) * len) / 2.5;
    const cpSin1 = (Math.sin(calcStartAngle) * len) / 2.5;
    const cpCos2 = (Math.cos(calcEndAngle) * len) / 2.5;
    const cpSin2 = (Math.sin(calcEndAngle) * len) / 2.5;

    const cp1x = connectStart.x + dir1 * cpCos1;
    const cp1y = connectStart.y + dir1 * cpSin1;
    const cp2x = connectEnd.x + dir2 * cpCos2;
    const cp2y = connectEnd.y + dir2 * cpSin2;

    const point1direction = connectStart.direction || Direction.L;

    const point1: Point = {
      ...connectStart,
      connectAngle: connectAngle1,
      direction: point1direction,
      type: 'c1',
    };

    const point2direction = connectStart.direction || Direction.R;

    const dragHitOffsetX = isMovingLeft ? 2 : -2;
    const dragHitOffsetY = isMovingUp ? 2 : -2;

    const point2: Point = {
      ...connectEnd,
      x: connectEnd.x + (finalize ? 0 : dragHitOffsetX),
      y: connectEnd.y + (finalize ? 0 : dragHitOffsetY),
      connectAngle: connectAngle2,
      direction: point2direction,
      type: 'c2',
    };

    const flexPoints: FlexPoints = [
      point1,
      {
        x: cp1x,
        y: cp1y,
        type: 'fcp1',
      },
      {
        x: cp2x,
        y: cp2y,
        type: 'fcp2',
      },
      point2,
    ];

    if (connectStart?.type === 'c1') {
      point1.type = 'c2';
      point2.type = 'c1';
    }

    return flexPoints;
  } else {
    console.error(
      'Calculate flexpoints needs connectFlexPointStart to be set.'
    );
  }
}

function addBezierCurveTo(path: d3.Path, bezier: Bezier) {
  path.bezierCurveTo(
    bezier.points[1].x,
    bezier.points[1].y,
    bezier.points[2].x,
    bezier.points[2].y,
    bezier.points[3].x,
    bezier.points[3].y
  );
}

export function generateFlexPaths(
  points: Point[],
  proto: ProtoSegmentFlex
): PathSegmentProps[] {
  const spread = GLEIS_WIDTH / 2;
  const spreadB = GLEIS_WIDTH_WB / 2;

  const [
    { x: x1, y: y1, direction, type: t1 },
    { x: cpx1, y: cpy1 },
    { x: cpx2, y: cpy2 },
    { x: x2, y: y2, direction: direction2 },
  ] = points;

  let previewBezier;

  try {
    previewBezier = new Bezier(x1, y1, cpx1, cpy1, cpx2, cpy2, x2, y2);
  } catch (e) {}

  if (!previewBezier) {
    return generateStraightPaths(
      points,
      proto as unknown as ProtoSegmentStraight
    );
  }

  const mainPath = d3.path();
  const splitsPath = d3.path();
  mainPath.moveTo(previewBezier.points[0].x, previewBezier.points[0].y);
  addBezierCurveTo(mainPath, previewBezier);

  const pathProps = new svgPathProperties(mainPath.toString());
  const pathLen = previewBezier.length();
  const flexCount = pathLen / proto.length;
  const sl = pathLen / flexCount;

  // Add line on every start of a new flex rail
  const splits = range(1, flexCount).map((c) => {
    const pt = pathProps.getPointAtLength(c * sl);
    const nv = pathProps.getTangentAtLength(c * sl);

    let pt1 = { x: pt.x - spreadB * nv.x, y: pt.y - spreadB * nv.y };
    let pt2 = { x: pt.x + spreadB * nv.x, y: pt.y + spreadB * nv.y };

    const center = getMidPoint(pt1.x, pt1.y, pt2.x, pt2.y);
    pt1 = rotate(center.x, center.y, pt1.x, pt1.y, toRad(90));
    pt2 = rotate(center.x, center.y, pt2.x, pt2.y, toRad(90));

    return [pt1, pt2];
  });

  let outerPath = d3.path();
  let curves;

  try {
    previewBezier.outline(spreadB).curves.forEach((c, i) => {
      if (i === 0) {
        outerPath.moveTo(c.points[0].x, c.points[0].y);
      }
      addBezierCurveTo(outerPath, c);
    });
  } catch (e) {
    const spreadAngle = toRad(cAngle(x1, y1, x2, y2));
    const spreadXB = spreadB * Math.cos(spreadAngle - A90);
    const spreadYB = spreadB * Math.sin(spreadAngle - A90);

    addStraightPathTo({
      path: outerPath,
      x1,
      y1,
      x2,
      y2,
      spreadX: spreadXB,
      spreadY: spreadYB,
    });
    // console.error(e);
  }

  for (const [p1, p2] of splits) {
    splitsPath.moveTo(p1.x, p1.y);
    splitsPath.lineTo(p2.x, p2.y);
  }

  const p1 = d3.path();
  previewBezier.offset(spread).forEach((c, i) => {
    if (i === 0) {
      p1.moveTo(c.points[0].x, c.points[0].y);
    }
    addBezierCurveTo(p1, c);
  });

  const p2 = d3.path();
  previewBezier.offset(-spread).forEach((c, i) => {
    if (i === 0) {
      p2.moveTo(c.points[0].x, c.points[0].y);
    }
    addBezierCurveTo(p2, c);
  });

  const path1: PathSegmentProps = { d: p1, type: 'p1' };
  const path2: PathSegmentProps = {
    d: p2,
    type: 'p2',
  };

  if (t1 === 'c2') {
    path1.type = 'p2';
    path2.type = 'p1';
  }

  const paths: PathSegmentProps[] = [
    {
      d: outerPath,
      type: 'outer',
    },
    {
      d: mainPath,
      type: 'main',
    },
    {
      d: splitsPath,
      type: 'splits',
    },
    path1,
    path2,
  ];

  return paths;
}
