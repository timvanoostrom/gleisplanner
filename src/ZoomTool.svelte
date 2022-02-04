<script lang="ts">
  import { get } from 'svelte/store';

  import { baseGroup, planeSvg } from './store/plane';
  import {
    dimensions,
    scale,
    setScaleValue,
    setViewBoxTranslation,
    svgCoords,
    tools,
  } from './store/workspace';
  import type { Point } from './types';

  export let width: number = 0;
  export let height: number = 0;
  export let x: number = 0;
  export let y: number = 0;

  const DEFAULT_SQUARE = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  $: square = { ...DEFAULT_SQUARE };

  let anchorPoint = null;
  let isDragging = false;

  function zoomAtPoint({ x, y }: Point) {}

  function startDrag(event) {
    if ($tools.zoom) {
      anchorPoint = svgCoords(event, $baseGroup as SVGGeometryElement);
      square.x = anchorPoint.x;
      square.y = anchorPoint.y;
    }
  }

  function doDrag(event) {
    if (anchorPoint && $tools.zoom) {
      const point = svgCoords(event, $baseGroup as SVGGeometryElement);
      const width = point.x - anchorPoint.x - 1;
      const height = point.y - anchorPoint.y - 1;

      square.width = Math.abs(width);
      square.height = Math.abs(height);

      if (width < 0) {
        square.x = anchorPoint.x + width;
      } else {
        square.x = anchorPoint.x;
      }

      if (height < 0) {
        square.y = anchorPoint.y + height;
      } else {
        square.y = anchorPoint.y;
      }
      isDragging = true;
    }
  }

  $: zoomX = 0;
  $: zoomY = 0;

  function endDrag(event) {
    if ($tools.zoom) {
      const centerX = square.x + square.width / 2;
      const centerY = square.y + square.height / 2;
      let scaleValue = 0.1;
      let newScale = $scale;

      zoomX = centerX;
      zoomY = centerY;

      switch (true) {
        case square.width > 20:
          scaleValue = 0.2;
        case square.width > 60:
          scaleValue = 0.4;
        case square.width > 120:
          scaleValue = 0.6;
      }

      if (event.shiftKey) {
        // zoom out
        newScale = $scale - scaleValue;
        setScaleValue(newScale);
      } else {
        // zoom in
        newScale = $scale + scaleValue;
        setScaleValue(newScale);
      }

      const planeDims = $planeSvg.getBoundingClientRect();

      console.log('planeDims:', planeDims);

      setViewBoxTranslation((translation) => {
        const dims = $dimensions;
        const width = dims.width;
        const height = dims.height;
        console.log(
          'dims',
          dims,
          { width, height },
          { x: centerX, y: centerY }
        );
        const translateX = width / 2 - centerX;
        const translateY = height / 2 - centerY;

        return {
          x: -(planeDims.width / 2),
          y: -(planeDims.height / 2),
        };
      });

      anchorPoint = null;
      square = { ...DEFAULT_SQUARE };
      isDragging = false;
    }
  }
</script>

<rect
  class="ZoomSpace"
  {x}
  {y}
  {width}
  {height}
  on:pointerdown={startDrag}
  on:pointermove={doDrag}
  on:pointerup={endDrag}
/>
{#if square.width > 0 && square.height > 0}
  <rect
    class="ZoomSquare"
    x={square.x}
    y={square.y}
    width={square.width}
    height={square.height}
  />
{/if}
<cirlce class="CP" r="3" cx={zoomX} cy={zoomY} />

<style>
  .CP {
    fill: red;
  }
  .ZoomSpace {
    fill: black;
    fill-opacity: 0.2;
  }
  .ZoomSquare {
    fill: none;
    stroke: #000;
    stroke-opacity: 1px;
    stroke-dasharray: 4px 4px;
  }
</style>
