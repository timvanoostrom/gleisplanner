<script lang="ts">
  import SVGPathCommander from 'svg-path-commander';
  import { svgPathProperties } from 'svg-path-properties';
  import { range, round } from './helpers/app';
  import { gleisPlanned } from './store/gleis';
  import type { GleisPlanned, Point, SlopeConfig } from './types';

  const MARKER_DISTANCE = 100;

  export let slope: SlopeConfig;

  function collectPathSegments(gleisPlanned: GleisPlanned, slope: SlopeConfig) {
    const pathSegments = [];
    // TODO: sort from...
    for (const id of slope.gleisIds) {
      const gleis = gleisPlanned[id];

      if (!gleis) {
        continue;
      }

      const mainPath = gleis?.pathSegments?.find(
        (path) => path.type === 'main'
      );

      pathSegments.push(mainPath.d);
    }
    return pathSegments;
  }

  function isWithinRadius(p1: Point, p2: Point, r: number) {
    const { x, y } = p1;
    const { x: a, y: b } = p2;

    const distance = (a - x) * (a - x) + (b - y) * (b - y);

    r *= r;

    return distance < r;
  }

  $: markers = [];
  $: path = '';

  $: {
    const pathSegments = collectPathSegments($gleisPlanned, slope);
    let index = [];
    let i = 0;
    const markersPrepare = [];
    const coords = new Map();

    if (pathSegments) {
      for (const segment of pathSegments) {
        const path = new svgPathProperties(segment);
        const total = path.getTotalLength();
        const mid = path.getPointAtLength(total / 2);
        const sp = path.getPointAtLength(0);
        const se = path.getPointAtLength(total);
        sp.x = round(sp.x, 2);
        sp.y = round(sp.y, 2);
        se.x = round(se.x, 2);
        se.y = round(se.y, 2);

        const s1 = `${sp.x},${sp.y}`;
        const s2 = `${se.x},${se.y}`;
        index.push([sp, se, i]);

        markersPrepare.push({
          path: segment,
          distance: 0,
          elevation: 0,
          total,
          x: mid.x,
          y: mid.y,
          n: i + 1,
          sp,
          se,
          s1,
          s2,
        });

        if (!coords.get(s1)) {
          coords.set(s1, [i]);
        } else {
          coords.get(s1).push(i);
        }
        if (!coords.get(s2)) {
          coords.set(s2, [i]);
        } else {
          coords.get(s2).push(i);
        }
        i++;
      }

      const values = Array.from(coords.values());
      const startIndex = values.findIndex((c) => c.length === 1);

      const re = [];

      if (startIndex !== -1) {
        re.push(values[startIndex][0]);
        console.log(startIndex, values);
        values.splice(startIndex, 1);

        if (values.length > 1) {
          while (values.length !== 0) {
            // Get last ID
            const last = re[re.length - 1];
            // Find link matching the last ID
            const nextIndex = values.findIndex((c) => c.includes(last));
            // Store Reference
            if (nextIndex !== -1) {
              const next = values[nextIndex];
              // Remove Reference from values
              values.splice(nextIndex, 1);
              // Push Next ID onto chain
              const isReversed = next[0] !== last || next.length !== 2;
              re.push(next[isReversed ? 0 : 1]);
            } else {
              // Broken chain
              console.log('Broken chain', last, 'not in', values);
              break;
            }
          }
        }
      }

      let prevEnd;
      markers = re.map((id, i) => {
        const m = { ...markersPrepare[id], n: i + 1 };
        const spath = new SVGPathCommander(m.path);
        if (prevEnd && !isWithinRadius(prevEnd, m.sp, 10)) {
          console.log('no klik!', id);
          spath.reverse();
          m.path = spath.toString();
          prevEnd = m.sp;
        } else {
          prevEnd = m.se;
        }
        return m;
      });

      path = markers.map((marker) => marker.path).join('');
      const pathCombined = new svgPathProperties(path);
      const count = Math.round((slope.totalLength * 10) / MARKER_DISTANCE);
      const elev = slope.endElevation / count;

      markers = range(0, count).map((n) => {
        return {
          ...pathCombined.getPointAtLength(MARKER_DISTANCE * n),
          elevation: parseFloat(
            String(slope.startElevation + n * elev)
          ).toFixed(2),
          distance: (MARKER_DISTANCE * n) / 10,
        };
      });
    }
  }
</script>

<g>
  {#each markers as marker}
    <g>
      <title>{marker.distance}cm - {marker.elevation}cm</title>
      <circle r="3" class="dot" cx={marker.x} cy={marker.y} />
      <circle class="hit" r="15" cx={marker.x} cy={marker.y} />
      <!-- <text class="SlopeSegmentLabel" x={marker.x} y={marker.y}
          >{marker.n}</text
        > -->
    </g>
  {/each}
  <!-- <path stroke="black" stroke-width="4" fill="none" d={path} /> -->
</g>

<style>
  .SlopeSegmentLabel {
    font-size: 20px;
  }
  .hit {
    fill: transparent;
    stroke: none;
  }
  .hit:hover {
    fill: purple;
    fill-opacity: 0.3;
  }
  .dot {
    fill: black;
    fill-opacity: 0;
    stroke: purple;
    stroke-width: 2;
  }
</style>
