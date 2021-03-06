import computedStyleToInlineStyle from 'computed-style-to-inline-style';

interface Point {
  x: number;
  y: number;
}

export function applyMatrixToPoint(
  svgRoot: SVGSVGElement,
  element: SVGGeometryElement,
  point: Point
) {
  const svgPoint = svgRoot.createSVGPoint();
  const m = element.transform.baseVal.consolidate()?.matrix;
  let svgPos = point;

  if (m) {
    svgPoint.x = svgPos.x;
    svgPoint.y = svgPos.y;
    svgPos = svgPoint.matrixTransform(m);
  }
  return {
    x: svgPos.x,
    y: svgPos.y,
  };
}

export function applyMatrixToPoint2(
  svgRoot: SVGSVGElement,
  matrix: SVGMatrix,
  point: Point
) {
  const svgPoint = svgRoot.createSVGPoint();
  let svgPos = point;

  if (matrix) {
    svgPoint.x = svgPos.x;
    svgPoint.y = svgPos.y;
    svgPos = svgPoint.matrixTransform(matrix);
  }
  return {
    x: svgPos.x,
    y: svgPos.y,
  };
}

export function baseGroupPoint(
  svgRoot: SVGSVGElement,
  baseGroup: SVGGElement,
  element: SVGGeometryElement,
  { x, y }: Point
): Point {
  const point = svgRoot.createSVGPoint();
  point.x = x;
  point.y = y;

  const pointTransformed = point.matrixTransform(
    element.getScreenCTM()!.inverse()
  );

  let svgPos = {
    x: pointTransformed.x,
    y: pointTransformed.y,
  };

  // Because we want to have the point relative to the BaseGroup we need to re-apply the transformation of the current element.
  if (element !== baseGroup && element.transform.baseVal.consolidate) {
    svgPos = applyMatrixToPoint(svgRoot, element, svgPos);
  }
  return {
    x: svgPos.x,
    y: svgPos.y,
  };
}

export function getPathMidPoint(pathProperties: any) {
  const pathLen = pathProperties.getTotalLength();
  const pathDistance = pathLen * 0.5;
  const midpoint = pathProperties.getPointAtLength(pathDistance);

  return midpoint;
}

export function downloadSvg(svgEl, name = 'svg-image.svg') {
  svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  computedStyleToInlineStyle(svgEl, {
    recursive: true,
    properties: [
      'fill',
      'stroke',
      'stroke-width',
      'stroke-opacity',
      'fill-opacity',
      'stroke-width',
      'paint-order',
      'stroke-linecap',
      'stroke-dasharray',
    ],
  });
  var svgData = svgEl.outerHTML;
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  var svgBlob = new Blob([preface, svgData], {
    type: 'image/svg+xml;charset=utf-8',
  });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
