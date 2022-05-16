<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { getClosestPointOnSVGPath } from './helpers/getClosestPointOnPath';

  import { baseGroupPoint } from './helpers/svg';
  import { baseGroup, planeSvg } from './store/plane';
  import type { Point } from './types';

  export let callback: (point: Point) => void = () => void 0;
  export let node: SVGPathElement;

  const dispatch = createEventDispatcher();

  $: mousePoint = null;
  $: pathPoint = null;

  function project(event) {
    mousePoint = baseGroupPoint(
      $planeSvg,
      $baseGroup,
      $baseGroup as SVGGeometryElement,
      {
        x: event.clientX,
        y: event.clientY,
      }
    );
    const p = getClosestPointOnSVGPath(node, [mousePoint.x, mousePoint.y]);
    pathPoint = p.point;
  }
</script>

<svelte:window on:pointermove={(event) => project(event)} />

{#if pathPoint}
  <circle
    cx={pathPoint[0]}
    cy={pathPoint[1]}
    r="25"
    class="TrackSelectPoint"
    on:click={() => dispatch('select', { x: pathPoint[0], y: pathPoint[1] })}
  />
{/if}

<style>
  .TrackSelectPoint {
    fill: transparent;
    stroke-width: 2px;
    stroke: #000;
    stroke-opacity: 0.9;
  }
</style>
