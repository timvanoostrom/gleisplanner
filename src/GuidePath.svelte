<script lang="ts">
  import * as d3 from 'd3-path';
  import { createEventDispatcher } from 'svelte';
  import { getMidPoint } from './helpers/geometry';
  import type { Point } from './types';

  export let points: Point[] = [];
  export let isSelected: boolean = false;
  export let isShape: boolean = false;
  export let isTemp: boolean = false;

  const dispatch = createEventDispatcher();
  let path;
  let pathString = '';

  function generatePathLabels(points: Point[]) {
    const len = points.length;
    const pathLabels = [];

    for (let i = 0; i < len; i++) {
      if (i !== 0) {
        const prevPoint = points[i - 1];
        const point = points[i];
        const midPoint = getMidPoint(
          prevPoint.x,
          prevPoint.y,
          point.x,
          point.y
        );
        const len = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
        pathLabels.push({
          ...midPoint,
          label: `${Math.round(len)}`,
        });
      }
    }
    return pathLabels;
  }

  function pathPointClick(event, point) {
    event.stopImmediatePropagation();
    dispatch('pathPointClick', point);
  }

  $: pathLabels = generatePathLabels(points);

  $: {
    path = d3.path();
    for (const point of points) {
      if (!path._) {
        path.moveTo(point.x, point.y);
      } else {
        path.lineTo(point.x, point.y);
      }
    }
    pathString = path.toString();
  }
</script>

<g on:click class="Guide" class:shape={isShape} class:isSelected>
  {#if path}
    <path d={pathString} class="GuidePath" />
  {/if}
  {#each points as point, index}
    {#if (isTemp && !isShape && index !== points.length - 1) || (!isTemp && !isShape) || (isShape && index === 0)}
      <circle
        cx={point.x}
        cy={point.y}
        r="10"
        class="PathPoint"
        on:click={(event) => pathPointClick(event, point)}
      />
    {/if}
  {/each}
  {#each pathLabels as label}
    <rect
      x={label.x - 50 / 2}
      y={label.y - 18}
      width="50"
      height="24"
      class="PathLabelBg"
    />
    <text x={label.x} y={label.y} r="10" class="PathLabel">
      {label.label}
    </text>
  {/each}
</g>

<style>
  .Guide.shape .GuidePath {
    fill: #fff;
  }
  .Guide.shape.isSelected .GuidePath {
    fill: red;
  }
  .PathPoint {
    fill: #fff;
    fill-opacity: 1;
    stroke: #000;
  }
  .PathPoint:hover {
    fill: red;
    stroke-width: 10px;
    stroke: red;
  }
  :global([data-editmode='guides']) .isSelected .GuidePath,
  :global([data-editmode='guides']) .Guide:hover .GuidePath {
    stroke: blue;
  }
  :global([data-editmode='guides']) .Guide:hover .PathPoint,
  :global([data-editmode='guides']) .isSelected .PathPoint {
    stroke: blue;
  }
  .GuidePath {
    stroke: #000;
    stroke-width: 2px;
    fill: none;
    stroke-opacity: 1;
    cursor: pointer;
  }
  .PathLabel {
    text-anchor: middle;
    font-size: 20px;
  }
  .PathLabelBg {
    fill: #fff;
  }
  .Guide.shape .GuidePath {
    stroke-width: 0;
  }
  .Guide.shape .PathLabelBg,
  .Guide.shape .PathLabel {
    display: none;
  }
</style>
