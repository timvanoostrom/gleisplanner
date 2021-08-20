import type { Point } from '../types';

export function toRad(degrees: number) {
  return degrees * (Math.PI / 180.0);
}

export function toDeg(radians: number) {
  return Math.round(radians * (180.0 / Math.PI));
}

/**
 * @brief Reflect point p along line through points p0 and p1
 *
 * @author Balint Morvai <balint@morvai.de>
 * @license http://en.wikipedia.org/wiki/MIT_License MIT License
 * @param p point to reflect
 * @param p0 first point for reflection line
 * @param p1 second point for reflection line
 * @return object
 */
export function reflect(p: Point, p0: Point, p1: Point): Point {
  var dx, dy, a, b, x, y;

  dx = p1.x - p0.x;
  dy = p1.y - p0.y;
  a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
  b = (2 * dx * dy) / (dx * dx + dy * dy);
  x = Math.round(a * (p.x - p0.x) + b * (p.y - p0.y) + p0.x);
  y = Math.round(b * (p.x - p0.x) - a * (p.y - p0.y) + p0.y);

  return { x: x, y: y };
}

export function getBBox(points: Point[]) {
  const x = points.map((point) => point.x);
  const y = points.map((point) => point.y);
  const minX = Math.min.apply(null, x) - 20;
  const minY = Math.min.apply(null, y) - 20;
  const maxX = Math.max.apply(null, x);
  const maxY = Math.max.apply(null, y);

  const width = maxX - minX + 20;
  const height = maxY - minY + 20;

  return {
    x,
    y,
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
  };
}

export function getCentroid(points: Point[]) {
  var x = points.map(({ x, y }) => x);
  var y = points.map(({ y }) => y);
  var cx = (Math.min(...x) + Math.max(...x)) / 2;
  var cy = (Math.min(...y) + Math.max(...y)) / 2;
  return { x: cx, y: cy };
}

export function cAngle(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number
) {
  var dx = originX - targetX;
  var dy = originY - targetY;

  // var theta = Math.atan2(dy, dx);  // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = west
  // theta *= 180 / Math.PI;          // [0, 180] then [-180, 0]; clockwise; 0° = west
  // if (theta < 0) theta += 360;     // [0, 360]; clockwise; 0° = west

  // var theta = Math.atan2(-dy, dx); // [0, Ⲡ] then [-Ⲡ, 0]; anticlockwise; 0° = west
  // theta *= 180 / Math.PI;          // [0, 180] then [-180, 0]; anticlockwise; 0° = west
  // if (theta < 0) theta += 360;     // [0, 360]; anticlockwise; 0° = west

  // var theta = Math.atan2(dy, -dx); // [0, Ⲡ] then [-Ⲡ, 0]; anticlockwise; 0° = east
  // theta *= 180 / Math.PI;          // [0, 180] then [-180, 0]; anticlockwise; 0° = east
  // if (theta < 0) theta += 360;     // [0, 360]; anticlockwise; 0° = east

  var theta = Math.atan2(-dy, -dx); // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = east
  theta *= 180 / Math.PI; // [0, 180] then [-180, 0]; clockwise; 0° = east
  if (theta < 0) theta += 360; // [0, 360]; clockwise; 0° = east

  return theta;
}

export function getTriangleCentroid(points: Point[]) {
  const x = (points[0].x + points[1].x + points[2].x) / 3;
  const y = (points[0].y + points[1].y + points[2].y) / 3;
  return { x, y };
}

export function lineDistance(point1: Point, point2: Point) {
  var xs = 0;
  var ys = 0;

  xs = point2.x - point1.x;
  xs = xs * xs;

  ys = point2.y - point1.y;
  ys = ys * ys;

  return Math.sqrt(xs + ys);
}

export function getMidPoint(x1: number, y1: number, x2: number, y2: number) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

export function rotate(
  cx: number,
  cy: number,
  x: number,
  y: number,
  angle: number
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const nx = cos * (x - cx) + sin * (y - cy) + cx;
  const ny = cos * (y - cy) - sin * (x - cx) + cy;
  return { x: nx, y: ny };
}

export function normalize(scale: number, n: number) {
  if (scale === 1) {
    return n;
  }

  const s2 = n / scale;
  const s1 = n * (1 / scale);

  return scale >= 1 ? s2 : s1;
}

export function normalizeAngleDeg(angle: number) {
  return Math.round(angle) % 360;
}

export function normalizeAngle(angle: number) {
  let angleDeg = toDeg(angle);
  if (angleDeg < -180) {
    angleDeg += 360;
  } else if (angleDeg > 180) {
    angleDeg -= 360;
  }
  return toRad(angleDeg);
}

export function limitValue(val: number, min: number, max: number) {
  return val < min ? min : val > max ? max : val;
}

export function calculateAngle(A: Point, B: Point, C: Point) {
  const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}
