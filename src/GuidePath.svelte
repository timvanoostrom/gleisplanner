<script lang="ts">
  import * as d3 from 'd3-path';
  import { createEventDispatcher } from 'svelte';
  import { getMidPoint } from './helpers/geometry';
  import type { Guide, Point } from './types';
  import { selectedGuideId } from './store/workspace';
  import { guideStyles } from './helpers/app';

  export let guide: Guide;
  export let isTemp: boolean = false;
  export let pointsSelected: Point[] = [];
  export let noselect: boolean = false;

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

  function pathPointClick(event, point, shiftKey) {
    event.stopImmediatePropagation();
    dispatch('pathPointClick', { point, shiftKey });
  }

  $: points = guide.points;
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

<g
  on:click
  class="Guide"
  class:isSelected={!noselect && guide.id === $selectedGuideId}
>
  {#if path}
    <path d={pathString} class="GuidePathSelect" />
    <path d={pathString} class="GuidePath" style={guideStyles(guide)} />
  {/if}
  {#each points as point, index}
    {#if (isTemp && index !== points.length - 1) || !isTemp}
      <circle
        cx={point.x}
        cy={point.y}
        r="6"
        class="PathPoint"
        class:isSelected={pointsSelected.includes(point)}
        on:click={(event) => pathPointClick(event, point, event.shiftKey)}
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
    <text x={label.x} y={label.y} class="PathLabel">
      {label.label}
    </text>
  {/each}
</g>

<style>
  .PathPoint {
    fill: #fff;
    fill-opacity: 1;
    stroke: #000;
  }

  .PathPoint:hover {
    stroke-width: 20px;
    stroke: purple;
  }
  .PathPoint.isSelected {
    stroke-width: 4px;
    stroke: red;
  }

  .GuidePath {
    stroke: #000;
    stroke-width: 2px;
    fill: none;
    stroke-opacity: 1;
    cursor: pointer;
  }
  .GuidePathSelect {
    fill: none;
    stroke: purple;
    stroke-width: 20px;
    stroke-opacity: 0;
  }
  .Guide:hover {
    cursor: pointer;
  }
  .Guide:hover .GuidePathSelect {
    stroke-opacity: 0.2;
  }
  .Guide.isSelected .GuidePathSelect {
    stroke: red;
    stroke-opacity: 0.2;
  }
  .PathLabel {
    text-anchor: middle;
    font-size: 20px;
  }
  .PathLabelBg {
    fill: #fff;
  }
</style>
