<script lang="ts">
  import throttle from 'lodash.throttle';
  import { getMidPoint, lineDistance } from './helpers/geometry';
  import { dimensions, svgCoords, tools } from './store/workspace';

  let measureToolRef;

  $: p1 = null;
  $: p2 = null;
  $: p2Move = null;
  $: p2Active = p2 || p2Move;
  $: length = p1 && p2Active && (lineDistance(p1, p2Active) / 10).toFixed(2);
  $: center = p1 && p2Active && getMidPoint(p1.x, p1.y, p2Active.x, p2Active.y);

  function setPoint(event: MouseEvent) {
    if ($tools.measure) {
      if (p1 && p2) {
        p1 = null;
        p2 = null;
        p2Move = null;
      } else if (!p1) {
        const point = svgCoords(event, measureToolRef);
        p1 = point;
      } else if (p1 && !p2) {
        p2 = p2Move;
      }
    }
  }

  function moveEndPoint(event: MouseEvent) {
    if ($tools.measure && p1 && !p2) {
      try {
        const point = svgCoords(event, measureToolRef);
        if (event.shiftKey && p2Move) {
          const moveDeltaX = Math.abs(p1.x - point.x);
          const moveDeltaY = Math.abs(p1.y - point.y);
          const key = moveDeltaY > moveDeltaX ? 'x' : 'y';
          point[key] = p1[key];
          p2Move = point;
        } else {
          p2Move = point;
        }
      } catch (error) {}
    }
  }

  const move = throttle(moveEndPoint, 30);
</script>

<svelte:window on:click={(event) => setPoint(event)} on:pointermove={move} />
{#if $tools.measure}
  <rect
    class="MeasurePlane"
    x={-$dimensions.width / 2}
    y={-$dimensions.height / 2}
    width={$dimensions.width}
    height={$dimensions.height}
  />
  <g bind:this={measureToolRef}>
    {#if p1 && p2Active}
      <circle r="4" class="MeasurePoint" cx={p1.x} cy={p1.y} />
      <line
        x1={p1.x}
        y1={p1.y}
        x2={p2Active.x}
        y2={p2Active.y}
        class="MeasureLine"
      />
      <circle r="4" class="MeasurePoint" cx={center.x} cy={center.y} />
      <text class="MeasureLabel" x={center.x} y={center.y}>{length}cm</text>
      <circle r="4" class="MeasurePoint" cx={p2Active.x} cy={p2Active.y} />
    {/if}
  </g>
{/if}

<style>
  .MeasurePlane {
    fill: #fff;
    fill-opacity: 0;
  }
  .MeasurePoint {
    fill: red;
  }
  .MeasureLabel {
    font-size: 20px;
    transform: translateY(-10px) translateX(5px);
  }
  .MeasureLine {
    stroke: #000;
    stroke-dasharray: 6px 4px;
    stroke-opacity: 1;
  }
</style>
