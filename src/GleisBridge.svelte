<script lang="ts">
  import { range } from './helpers/app';
  import * as d3 from 'd3-path';
  import { svgPathProperties } from 'svg-path-properties';
  import type { GleisPropsPlanned } from './types';
  import { getMidPoint, rotate, toRad } from './helpers/geometry';
  import { GLEIS_WIDTH_WB } from './config/constants';

  export let gleisProps: GleisPropsPlanned;
  const spreadB = GLEIS_WIDTH_WB * 0.75;

  function generateBridgeSegments(path: string) {
    const splitsPath = d3.path();
    const pathProps = new svgPathProperties(path);
    const pathLen = pathProps.getTotalLength();
    _l('pathLen', pathLen);
    const sl = 15;

    const max = pathLen / sl;
    const splits = range(1, max).map((c) => {
      const pt = pathProps.getPointAtLength(c * sl);
      const nv = pathProps.getTangentAtLength(c * sl);

      let pt1 = { x: pt.x - spreadB * nv.x, y: pt.y - spreadB * nv.y };
      let pt2 = { x: pt.x + spreadB * nv.x, y: pt.y + spreadB * nv.y };

      pt1 = rotate(pt.x, pt.y, pt1.x, pt1.y, toRad(90));
      pt2 = rotate(pt.x, pt.y, pt2.x, pt2.y, toRad(90));

      return [pt1, pt2, pt];
    });

    const splitEntries = Object.entries(splits);

    for (const [i, [p1, p2]] of splitEntries) {
      const index = parseInt(i, 10);
      splitsPath.moveTo(p1.x, p1.y);
      splitsPath.lineTo(p2.x, p2.y);

      if (index > 0) {
        const prevP1 = splitEntries[`${index - 1}`][1][0];
        const prevP2 = splitEntries[`${index - 1}`][1][1];
        splitsPath.moveTo(prevP1.x, prevP1.y);
        splitsPath.lineTo(p1.x, p1.y);
        splitsPath.moveTo(prevP2.x, prevP2.y);
        splitsPath.lineTo(p2.x, p2.y);
      }
    }
    console.log('splits', splits);
    return splitsPath;
  }

  $: mainPath = gleisProps.pathSegments?.find(
    (pathSegment) => pathSegment.type === 'main'
  );
</script>

<g class="bridge-parts">
  <path d={mainPath.d.toString()} class={`bridge`} />
  <path
    d={generateBridgeSegments(mainPath?.d?.toString()).toString()}
    class={`bridge-segment`}
  />
</g>

<!-- <path
  d={generateBridgeSegments(mainPath.d.toString()).toString()}
  class={`bridge-segment`}
/> -->
<style>
  .bridge {
    fill: none;
    stroke-width: 40px;
    stroke: #000;
    stroke-linecap: butt;
    stroke-opacity: 0;
  }
  .bridge-segment {
    stroke: black;
    stroke-opacity: 0.9;
    stroke-width: 1px;
  }
</style>
