/**
 * Find the closest point on a SVG path to an off-path point.
 * @param pathNode
 * @param point
 * @returns
 */
export function getClosestPointOnSVGPath(
  pathNode: SVGPathElement,
  point: number[]
): {
  point: number[];
  distance: number;
  length: number;
  t: number;
} {
  function distance2(p: DOMPoint, point: number[]) {
    const dx = p.x - point[0],
      dy = p.y - point[1];
    return dx * dx + dy * dy;
  }

  const pathLen = pathNode.getTotalLength();

  let p = 8,
    best: DOMPoint,
    bestLen: number,
    bestDist = Infinity,
    bl: number,
    al: number;

  // linear scan for coarse approximation
  for (
    let scan: DOMPoint, scanLen = 0, scanDist: number;
    scanLen <= pathLen;
    scanLen += p
  ) {
    if (
      (scanDist = distance2(
        (scan = pathNode.getPointAtLength(scanLen)),
        point
      )) < bestDist
    ) {
      (best = scan), (bestLen = scanLen), (bestDist = scanDist);
    }
  }

  // binary search for precise estimate
  p /= 2;

  while (p > 0.5) {
    let before: DOMPoint, after: DOMPoint, bd: number, ad: number;
    if (
      (bl = bestLen - p) >= 0 &&
      (bd = distance2((before = pathNode.getPointAtLength(bl)), point)) <
        bestDist
    ) {
      (best = before), (bestLen = bl), (bestDist = bd);
    } else if (
      (al = bestLen + p) <= pathLen &&
      (ad = distance2((after = pathNode.getPointAtLength(al)), point)) <
        bestDist
    ) {
      (best = after), (bestLen = al), (bestDist = ad);
    } else {
      p /= 2;
    }
  }

  return {
    point: [best.x, best.y],
    distance: bestDist,
    length: (bl + al) / 2,
    t: (bl + al) / 2 / pathLen,
  };
}
