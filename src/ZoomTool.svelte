<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from 'svelte';
  import svgPanZoom from 'svg-pan-zoom';
  import { baseGroup, planeSvg } from './store/plane';
  import { svgCoords, toggleTool, tools } from './store/workspace';

  export let width: number = 0;
  export let height: number = 0;
  export let x: number = 0;
  export let y: number = 0;

  const DEFAULT_SQUARE = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
  };

  $: square = { ...DEFAULT_SQUARE };

  let anchorPoint = null;
  let svgPanZoomzer;

  onMount(() => {
    console.log('mounting!');
    svgPanZoomzer = svgPanZoom($planeSvg, {
      minZoom: 0.1,
      maxZoom: 10,
      mouseWheelZoomEnabled: false,
      dblClickZoomEnabled: false,
      panEnabled: false,
      // onZoom: (event) => {
      //   console.log('event', event);
      // },
    });
  });

  onDestroy(() => {
    // console.log('destroyyyyyy!');
    // setTimeout(() => {
    //   svgPanZoomzer.destroy();
    //   svgPanZoomzer = null;
    // }, 100);
  });

  function startDrag(event) {
    if ($tools.zoom) {
      anchorPoint = svgCoords(event, $baseGroup as SVGGeometryElement);
      square.x = anchorPoint.x;
      square.y = anchorPoint.y;
      square.mouseX = event.clientX;
      square.mouseY = event.clientY;
    }
  }

  function doDrag(event) {
    if (anchorPoint && $tools.zoom) {
      const point = svgCoords(event, $baseGroup as SVGGeometryElement);
      const width = point.x - anchorPoint.x - 5;
      const height = point.y - anchorPoint.y - 5;

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
    }
  }

  $: zoomX = 0;
  $: zoomY = 0;

  function endDrag(event) {
    if ($tools.zoom) {
      const centerX = square.x + square.width / 2;
      const centerY = square.y + square.height / 2;

      zoomX = centerX;
      zoomY = centerY;

      let point = $planeSvg.createSVGPoint();
      console.log('sq', square);
      point.x = square.mouseX + square.width / 2;
      point.y = square.mouseY + square.height / 2;

      const zoomPoint = point.matrixTransform(
        $planeSvg.getScreenCTM().inverse()
      );

      let currentZoom = svgPanZoomzer.getZoom();
      const zoomDelta = Math.max(Math.round(square.width / 10), 1) * 0.1;
      const newZoom = currentZoom + (shiftPressed ? -zoomDelta : zoomDelta);

      console.log('t', newZoom);

      svgPanZoomzer.zoomAtPoint(newZoom, zoomPoint);
      // this.zoomAtPoint(zoomFactor, point);

      anchorPoint = null;
      square = { ...DEFAULT_SQUARE };
    }
  }
  let shiftPressed = false;

  $: zoomIn = $tools.zoom && !shiftPressed;
  $: zoomOut = $tools.zoom && shiftPressed;

  function onKeyRouter(event) {
    shiftPressed = event.shiftKey;
  }
  function onKeyDownRouter(event) {
    onKeyRouter(event);
  }
  function onKeyUpRouter(event) {
    if (event.key === 'z') {
      toggleTool('zoom');
    }
    onKeyRouter(event);
  }
</script>

<svelte:window on:keydown={onKeyDownRouter} on:keyup={onKeyUpRouter} />
{#if $tools.zoom}
  <rect
    class="ZoomSpace"
    {x}
    {y}
    {width}
    {height}
    on:pointerdown={startDrag}
    on:pointermove={doDrag}
    on:pointerup={endDrag}
    class:zoom-in={zoomIn}
    class:zoom-out={zoomOut}
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
  <!-- <circle class="CP" r="30" cx={zoomX} cy={zoomY} /> -->
{/if}

<style>
  .CP {
    fill: red;
  }
  .ZoomSpace {
    fill-opacity: 0;
  }
  .zoom-in {
    cursor: zoom-in;
  }
  .zoom-out {
    cursor: zoom-out;
  }
  .ZoomSquare {
    fill: none;
    stroke: #000;
    stroke-opacity: 1px;
    stroke-dasharray: 4px 4px;
  }
</style>
