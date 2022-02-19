<script lang="ts">
  import SVGPathCommander from 'svg-path-commander';
  import { svgPathProperties } from 'svg-path-properties';
  import { range, round } from './helpers/app';
  import { isWithinRadius } from './helpers/geometry';
  import { getCoordString, gleisPlanned } from './store/gleis';
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

  $: markers = [];
  $: path = '';

  $: {
    const pathSegments = collectPathSegments($gleisPlanned, slope);
    let index = [];
    let i = 0;
    const segmentSources = [];
    const coords = new Map();

    if (pathSegments) {
      for (const segment of pathSegments) {
        const path = new svgPathProperties(segment);
        const total = path.getTotalLength();
        const mid = path.getPointAtLength(total / 2);
        const point1 = path.getPointAtLength(0);
        const point2 = path.getPointAtLength(total);
        point1.x = round(point1.x, 2);
        point1.y = round(point1.y, 2);
        point2.x = round(point2.x, 2);
        point2.y = round(point2.y, 2);

        const point1String = getCoordString(point1);
        const point2String = getCoordString(point2);
        index.push([point1, point2, i]);

        segmentSources.push({
          path: segment,
          distance: 0,
          elevation: 0,
          total,
          x: mid.x,
          y: mid.y,
          n: i + 1,
          point1,
          point2,
        });

        if (!coords.get(point1String)) {
          coords.set(point1String, [i]);
        } else {
          coords.get(point1String).push(i);
        }

        if (!coords.get(point2String)) {
          coords.set(point2String, [i]);
        } else {
          coords.get(point2String).push(i);
        }

        i++;
      }

      console.dir(coords);

      const ids = Array.from(coords.values());
      const startAtIndex = ids.findIndex((ids) => ids.length === 1);

      const idChain = [];

      if (startAtIndex !== -1) {
        // First point
        const startAtId = ids[startAtIndex][0];
        idChain.push(startAtId);

        // Remove id from available ids
        ids.splice(startAtIndex, 1);

        if (ids.length > 1) {
          while (ids.length !== 0) {
            // Get last ID in the chain
            const lastId = idChain[idChain.length - 1];
            // Find link matching the lastId ID
            const connectingIdIndex = ids.findIndex((c) => c.includes(lastId));
            // Store Reference
            if (connectingIdIndex !== -1) {
              const connectingIds = ids[connectingIdIndex];
              // Remove Reference from ids
              ids.splice(connectingIdIndex, 1);
              // Push connectingIds ID onto chain
              if (connectingIds.length > 1) {
                const isReversed =
                  connectingIds[0] !== lastId || connectingIds.length !== 2;
                idChain.push(connectingIds[isReversed ? 0 : 1]);
              }
            } else {
              // Broken chain
              console.log('Broken chain', lastId, 'not in', ids);
              break;
            }
          }
        }
      }

      if (idChain.length) {
        const startSegment = segmentSources[idChain[0]];
        const sPoint1 = getCoordString(startSegment.point1);

        let prevEnd =
          coords.get(sPoint1).length === 1
            ? startSegment?.point1
            : startSegment?.point2;

        const segments = idChain.map((id, i) => {
          const segment = segmentSources[id];
          const spath = new SVGPathCommander(segment.path, {});

          if (!isWithinRadius(prevEnd, segment.point1, 10)) {
            console.log('reverse connection', id);
            spath.reverse(false);
            segment.path = spath.toString();
            prevEnd = segment.point1;
          } else {
            console.log('proper connection', id);
            prevEnd = segment.point2;
          }
          return segment;
        });

        path = segments.map((segment) => segment.path).join('');

        const pathCombined = new svgPathProperties(path);
        const count = Math.round((slope.totalLength * 10) / MARKER_DISTANCE);
        const elev = slope.elevation / count;

        markers = range(0, count)
          .filter((n) => MARKER_DISTANCE * n <= slope.totalLength * 10)
          .map((n) => {
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
  }
</script>

<g>
  {#each markers as marker, i}
    <g>
      <title>{marker.distance}cm - {marker.elevation}cm</title>
      <circle r="3" class="dot" cx={marker.x} cy={marker.y} />
      <text class="SlopeSegmentLabel" x={marker.x} y={marker.y}>
        {marker.elevation}
      </text>
      <circle class="hit" r="15" cx={marker.x} cy={marker.y} />
    </g>
  {/each}
  <!-- <path stroke="black" stroke-width="4" fill="none" d={path} /> -->
</g>

<style>
  .SlopeSegmentLabel {
    font-size: 1.6em;
    transform: translateX(5px);
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
