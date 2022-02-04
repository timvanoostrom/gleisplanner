<script lang="ts">
  import debounce from 'lodash.debounce';
  import { derived } from 'svelte/store';
  import { patternSelectedGleis } from './config/svg-fill-patterns';
  import GridLines from './GridLines.svelte';
  import { layerPatterns } from './store/layerControl';
  import { availableSpaceElement, baseGroup, planeSvg } from './store/plane';
  import {
    dimensions,
    isGridVisible,
    scale,
    setViewBoxTranslation,
    svgCoords,
    tools,
    viewBoxTranslation,
  } from './store/workspace';
  import ZoomTool from './ZoomTool.svelte';

  const viewBoxTranslationInitial = $viewBoxTranslation;

  let isDragActive: boolean = false;
  let anchorPoint;

  $: isDragTranslateBlocked = $tools.zoom;

  const scaleTransformAttribute = derived(scale, (scale) => {
    const base = $baseGroup;

    if (!base) {
      return `scale(${scale})`;
    }

    const attrString = `scale(${scale})`;

    return attrString;
  });

  const saveViewboxTranslation = debounce((x: number, y: number) => {
    setViewBoxTranslation((translation) => {
      if (translation === null) {
        return viewBoxTranslationInitial;
      }
      return {
        x,
        y,
      };
    });
  }, 100);

  function shiftViewBox(deltaX: number, deltaY: number) {
    console.log($planeSvg.viewBox.baseVal);
    $planeSvg.viewBox.baseVal.x += deltaX;
    $planeSvg.viewBox.baseVal.y += deltaY;
    saveViewboxTranslation(
      $planeSvg.viewBox.baseVal.x,
      $planeSvg.viewBox.baseVal.y
    );
  }

  const startDragTranslate = (event) => {
    if (event.currentTarget === $planeSvg) {
      isDragActive = true;
      anchorPoint = svgCoords(event, $planeSvg);
    }
  };

  const doDragTranslate = (event: MouseEvent) => {
    if (isDragActive) {
      const targetPoint = svgCoords(event, $planeSvg);
      shiftViewBox(
        anchorPoint.x - targetPoint.x,
        anchorPoint.y - targetPoint.y
      );
    }
  };

  const endDragTranslate = (event) => {
    if (isDragActive) {
      isDragActive = false;
    }
  };

  const startDrag = (event) => {
    if (!event.metaKey && !isDragTranslateBlocked) {
      startDragTranslate(event);
    }
  };

  const doDrag = (event: MouseEvent) => {
    if (!event.metaKey && !isDragTranslateBlocked) {
      doDragTranslate(event);
    }
  };

  const endDrag = (event) => {
    if (!event.metaKey && !isDragTranslateBlocked) {
      endDragTranslate(event);
    }
  };
</script>

<div id="gleis-plane" class="Plane">
  <svg
    bind:this={$planeSvg}
    id="gleis-svg"
    viewBox={`${$viewBoxTranslation.x} ${$viewBoxTranslation.y} ${
      $dimensions.width / 2
    } ${$dimensions.height / 2}`}
    on:pointerdown={startDrag}
    on:pointermove={doDrag}
    on:pointerup={endDrag}
  >
    <defs>
      {#each $layerPatterns as pattern}
        <g>{@html pattern}</g>
      {/each}
      <g>{@html patternSelectedGleis}</g>
    </defs>
    <g
      bind:this={$baseGroup}
      id="gleis-base-group"
      class="ScaleSpace"
      transform={$scaleTransformAttribute}
    >
      <rect
        bind:this={$availableSpaceElement}
        class="AvailableSpace"
        x={-$dimensions.width / 2}
        y={-$dimensions.height / 2}
        width={$dimensions.width}
        height={$dimensions.height}
      />

      {#if $isGridVisible}<GridLines />{/if}

      <circle r={10} fill="blue" cx={0} cy={0} />
      <slot />
      {#if $tools.zoom}
        <ZoomTool
          x={-$dimensions.width / 2}
          y={-$dimensions.height / 2}
          width={$dimensions.width}
          height={$dimensions.height}
        />
      {/if}
    </g>
  </svg>
</div>

<style>
  #gleis-svg {
    height: 100%;
    width: 100%;
  }

  .Plane {
    background-color: #555;
    overflow: hidden;
    position: relative;
    height: calc(100vh - 90px);
    width: 100%;
  }

  .AvailableSpace {
    fill: #fff;
    outline: 10px solid goldenrod;
  }

  .ScaleSpace {
  }

  .DragSelectArea {
    fill: none;
    stroke: #000;
    stroke-width: 1px;
    stroke-dasharray: 4px 8px;
  }
</style>
