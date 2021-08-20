import * as d3 from "d3-path";
import { svgPathProperties } from "svg-path-properties";
import {
  A180,
  A360,
  GLEIS_WIDTH,
  GLEIS_WIDTH_WB,
  A90,
} from "../config/constants";
import type { PathSegmentProps, Point, ProtoSegmentCurve } from "../types";
import { Direction } from "../types";
import { normalizeAngle, toDeg, toRad } from "./geometry";
import { getPathMidPoint } from "./svg";

interface curveCenterProps {
  x: number;
  y: number;
  angle: number;
  radius: number;
}

export function curveCenter({ x, y, angle, radius }: curveCenterProps) {
  const a1 = Math.cos(angle) * radius;
  const a2 = Math.sin(angle) * radius;
  const centerX = x + a1;
  const centerY = y + a2;

  return [centerX, centerY];
}

function calcAngle(connectAngle: number) {
  if (connectAngle <= 0) {
    return normalizeAngle(A360 + connectAngle);
  }
  return normalizeAngle(connectAngle);
}

function calcConnectAngle(drawAngle: number) {
  return normalizeAngle(drawAngle - toRad(270));
}

export interface CalculateCurvePointsProps {
  pointOrigin: Point;
  proto: ProtoSegmentCurve;
  connectingPointOrigin?: Point;
}

export function calculateCurvePoints({
  pointOrigin,
  proto,
  connectingPointOrigin,
}: CalculateCurvePointsProps): Point[] {
  let { connectAngle = 0, x: x1 = 450, y: y1 = 250, direction } = pointOrigin;
  const isRoot = pointOrigin.root === true;

  if (connectAngle === -A180) {
    connectAngle = A180;
  }

  if (proto.length1) {
    x1 = x1 + Math.cos(connectAngle + A90 * direction) * proto.length1;
    y1 = y1 + Math.sin(connectAngle + A90 * direction) * proto.length1;
  }

  let curveCenterAngle = 0;
  let startAngle = 0;
  let endAngle = 0;

  startAngle = connectAngle;
  endAngle = startAngle + proto.angle * direction;
  curveCenterAngle = connectAngle + A180 * direction;

  const [curveCenterX, curveCenterY] = curveCenter({
    x: x1,
    y: y1,
    radius: proto.radius,
    angle: curveCenterAngle,
  });

  const mainPath = d3.path();
  const counterClockWise = endAngle < startAngle;

  mainPath.moveTo(x1, y1);
  mainPath.arc(
    curveCenterX,
    curveCenterY,
    proto.radius,
    startAngle,
    endAngle,
    counterClockWise
  );

  const arcCenter = getPathMidPoint(new svgPathProperties(mainPath.toString()));
  let { _x0, _y0, _x1: endX, _y1: endY } = mainPath as any;

  if (proto.length2) {
    endX =
      endX +
      Math.cos(connectAngle + (proto.angle + A90) * direction) * proto.length2;
    endY =
      endY +
      Math.sin(connectAngle + (proto.angle + A90) * direction) * proto.length2;
  }

  const curveDirection =
    isRoot && counterClockWise
      ? Direction.R
      : isRoot
      ? Direction.L
      : direction === Direction.L
      ? Direction.R
      : Direction.L;

  const point1: Point = {
    x: pointOrigin.x,
    y: pointOrigin.y,
    type: "c1",
    direction: curveDirection,
    connectAngle: startAngle,
  };

  const point2: Point = {
    x: endX,
    y: endY,
    type: "c2",
    direction: direction,
    connectAngle: endAngle,
  };

  if (connectingPointOrigin?.type === "c1") {
    point1.type = "c2";
    point2.type = "c1";
  }

  if (isRoot) {
    point1.root = true;
  }

  const points: Point[] = [
    point1,
    point2,
    {
      x: curveCenterX,
      y: curveCenterY,
      type: "cc",
    },
    {
      x: arcCenter.x,
      y: arcCenter.y,
      connectAngle: connectAngle,
      type: "lbl",
    },
  ];

  return points;
}

export function generateCurvePaths(
  points: Point[],
  proto: ProtoSegmentCurve
): PathSegmentProps[] {
  let [
    { x: x1, y: y1, connectAngle: startAngle, direction, type: t1 },
    { x: x2, y: y2, connectAngle: endAngle, direction: direction2 },
    { x: cx, y: cy },
  ] = points;

  const counterClockWise =
    endAngle < startAngle && !(startAngle === A180 && endAngle < 0);
  const spread = GLEIS_WIDTH / 2;
  const spreadB = GLEIS_WIDTH_WB / 2;

  const mainPath = d3.path();

  mainPath.moveTo(x1, y1);
  mainPath.arc(cx, cy, proto.radius, startAngle, endAngle, counterClockWise);

  const outerPath = d3.path();

  outerPath.arc(
    cx,
    cy,
    proto.radius - spreadB,
    startAngle,
    endAngle,
    counterClockWise
  );
  outerPath.arc(
    cx,
    cy,
    proto.radius + spreadB,
    endAngle,
    startAngle,
    !counterClockWise
  );
  outerPath.closePath();

  const p1 = d3.path();
  p1.arc(cx, cy, proto.radius - spread, startAngle, endAngle, counterClockWise);

  const p2 = d3.path();
  p2.arc(cx, cy, proto.radius + spread, startAngle, endAngle, counterClockWise);

  const path1: PathSegmentProps = { d: p1, type: "p1" };
  const path2: PathSegmentProps = {
    d: p2,
    type: "p2",
  };

  if (
    (direction2 === direction &&
      ((direction === Direction.R && t1 === "c2") ||
        (direction === Direction.L && t1 === "c1"))) ||
    (direction2 !== direction &&
      ((direction === Direction.R && t1 === "c1") ||
        (direction === Direction.L && t1 === "c2")))
  ) {
    path1.type = "p2";
    path2.type = "p1";
  }

  const paths: PathSegmentProps[] = [
    {
      d: outerPath,
      type: "outer",
    },
    {
      d: mainPath,
      type: "main",
    },
    path1,
    path2,
  ];

  return paths;
}
