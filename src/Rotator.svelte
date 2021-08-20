<script lang="ts">
  import { range } from './helpers/app';
  import { toRad, normalizeAngleDeg } from './helpers/geometry';
  import type { Point } from './types';

  export let center: Point = { x: 0, y: 0 };
  export let count: number = 36;
  export let radius: number = 400;
  export let leg: number = 100;

  const angle = 360 / count;
  const offset = -180;
  $: segments = range(0, count - 1).map((s) => {
    return {
      x1: center.x + Math.cos(toRad(s * angle + offset)) * (radius - leg),
      y1: center.y + Math.sin(toRad(s * angle + offset)) * (radius - leg),
      x2: center.x + Math.cos(toRad(s * angle + offset)) * radius,
      y2: center.y + Math.sin(toRad(s * angle + offset)) * radius,
      angle: offset + s * angle,
    };
  });
</script>

<g>
  {#each segments as line}
    <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} class="segment" />
    <text text-anchor="middle" x={line.x1} y={line.y1}>{line.angle}&deg;</text>
    <text text-anchor="middle" x={line.x2} y={line.y2}
      >{normalizeAngleDeg(line.angle + 90)}&deg;</text
    >
  {/each}
</g>

<style>
  .segment {
    stroke: #000;
    stroke-width: 1px;
  }
</style>
