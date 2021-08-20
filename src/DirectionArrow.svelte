<script lang="ts">
  import type { Point } from './types';
  import { Direction } from './types';
  import { toDeg } from './helpers/geometry';
  import { A180, A90 } from './config/constants';

  export let point: Point;

  const length = 6;

  let angle = point.connectAngle;

  angle = toDeg(angle);
  // let x = point.x + Math.cos(angle) * 20;
  // let y = point.y + Math.sin(angle) * 20;
</script>

<path
  transform={`rotate(${angle}, ${point.x}, ${point.y})`}
  class="directionPath"
  d={`M${point.x},${point.y} L${point.x + length},${point.y} M${point.x},${
    point.y
  } L${point.x},${point.y - length}`}
/>

<!-- <line x1={point.x} y1={point.y} x2={x} y2={y} class="directionPath p2" /> -->
<style>
  .directionPath {
    stroke: #000;
    stroke-width: 1px;
  }
</style>
