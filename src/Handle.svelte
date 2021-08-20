<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { toDeg } from './helpers/geometry';
  import type { Point } from './types';

  export let label: string = '';
  export let point: Point;

  const dispatch = createEventDispatcher();

  const x1 = point.x + Math.cos(point.connectAngle) * 20;
  const y1 = point.y + Math.sin(point.connectAngle) * 20;

  const x2 = point.x - Math.cos(point.connectAngle) * 20;
  const y2 = point.y - Math.sin(point.connectAngle) * 20;

  function connect(event: MouseEvent, point: Point) {
    event.stopPropagation();
    dispatch('connect', point);
  }
</script>

<g>
  <title>
    {point.type} / {toDeg(point.connectAngle)}&deg; {point.direction}
  </title>
  {#if label}
    <text x={point.x - (point.type === 'c2' ? 40 : -10)} y={point.y}>
      {label}
    </text>
  {/if}
  <circle class={`Handle ${point.type}`} cx={point.x} cy={point.y} r="8" />
  {#if x1 && y1 && x2 && y2}
    <line {x1} {y1} {x2} {y2} class="SplitLine" />
  {/if}
  <circle
    class={`HandleClick ${point.type}`}
    cx={point.x}
    cy={point.y}
    r="10"
    on:click={(event) => connect(event, point)}
  />
</g>

<style>
  .HandleClick {
    fill: purple;
    fill-opacity: 0;
    stroke-opacity: 0;
    stroke: #999;
    stroke-width: 1px;
    stroke-dasharray: 2px 2px;
  }
  .Handle {
    fill: #fff;
    fill-opacity: 1;
    stroke: #000;
    stroke-width: 1px;
  }
  .HandleClick:hover {
    stroke-opacity: 1;
    fill-opacity: 0.5;
  }
  .SplitLine {
    stroke: #000;
    stroke-width: 1px;
  }
</style>
