<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Readable } from 'svelte/store';
  import { isCutPathActive } from './store/gleis';
  import { svgCoords } from './store/workspace';
  import type { GleisPropsPlanned } from './types';

  export let selectionArea: Partial<DOMRect>;
  export let gleisSelected: Readable<GleisPropsPlanned[]>;

  let transformHost: SVGGeometryElement;
  let anchorPoint;
  let isDragActive: boolean = false;
  let dragTranslation = { x: 0, y: 0 };

  let prevX;
  let prevY;
  let deltaX = 0;
  let deltaY = 0;
  let moveHorizontal;
  let moveVertical;

  const dispatch = createEventDispatcher();

  // Incremental translation updates because update cycles are messy when using a single value, try it!
  $: translationTransform = isDragActive
    ? `translate(${dragTranslation.x} ${dragTranslation.y}) ${translationTransform}`
    : '';

  function startDragTranslate(event) {
    if (!isDragActive) {
      event.stopImmediatePropagation();
      anchorPoint = svgCoords(event, transformHost);
      isDragActive = true;
    }
  }

  function doDragTranslate(event) {
    if (isDragActive) {
      event.stopImmediatePropagation();
      const targetPoint = svgCoords(event, transformHost);

      deltaX += Math.abs(event.movementX);
      deltaY += Math.abs(event.movementY);

      moveHorizontal = deltaX > deltaY;
      moveVertical = !moveHorizontal;

      dragTranslation.x =
        moveVertical && event.shiftKey ? 0 : targetPoint.x - anchorPoint.x;

      dragTranslation.y =
        moveHorizontal && event.shiftKey ? 0 : targetPoint.y - anchorPoint.y;

      // dragTranslation.x = targetPoint.x - anchorPoint.x;
      // dragTranslation.y = targetPoint.y - anchorPoint.y;

      _l('moving', moveVertical, moveVertical);
    }
  }

  function endDragTranslate(event) {
    if (isDragActive) {
      event.stopImmediatePropagation();

      prevX = undefined;
      prevY = undefined;

      deltaX = 0;
      deltaY = 0;

      dispatch('done', {
        host: transformHost,
      });
      isDragActive = false;
      prevTranslate = 0;
    }
  }

  function updateSelectedGleisPoints(prop: 'x' | 'y', n: number) {
    const updates = $gleisSelected.map((gleis) => {
      return {
        id: gleis.id,
        points: gleis.points.map((point) => ({
          ...point,
          [prop]: point[prop] + n,
        })),
      };
    });
    dispatch('done', {
      host: transformHost,
      updates,
    });
  }

  let prevTranslate = 0;

  $: isMultiSelectActive = false;

  function onKeyupRouter(event) {
    if (!event.shiftKey) {
      isMultiSelectActive = false;
    }
  }
  function onKeydownRouter(event) {
    let delta = 1;
    const translateHitDelta = Date.now() - prevTranslate;

    if (prevTranslate !== 0 && translateHitDelta < 200) {
      delta = 10;
    } else if (
      prevTranslate !== 0 &&
      translateHitDelta > 200 &&
      translateHitDelta < 400
    ) {
      delta = 5;
    }

    if (event.shiftKey) {
      isMultiSelectActive = true;
    }

    switch (event.key) {
      case 'ArrowRight':
        if (event.shiftKey) {
          event.stopImmediatePropagation();
          updateSelectedGleisPoints('x', delta);
        }
        break;
      case 'ArrowLeft':
        if (event.shiftKey) {
          event.stopImmediatePropagation();
          updateSelectedGleisPoints('x', -delta);
        }
        break;
      case 'ArrowUp':
        if (event.shiftKey) {
          event.stopImmediatePropagation();
          updateSelectedGleisPoints('y', -delta);
        }
        break;
      case 'ArrowDown':
        if (event.shiftKey) {
          event.stopImmediatePropagation();
          updateSelectedGleisPoints('y', delta);
        }
        break;
    }
    prevTranslate = Date.now();
  }
</script>

<svelte:window
  on:keydown={onKeydownRouter}
  on:keyup={onKeyupRouter}
  on:pointermove={doDragTranslate}
/>

<g
  bind:this={transformHost}
  class="TransformHost"
  transform={translationTransform}
>
  {#if !isMultiSelectActive && !$isCutPathActive && selectionArea}
    <rect
      class="selectionArea"
      x={selectionArea.x}
      y={selectionArea.y}
      width={selectionArea.width}
      height={selectionArea.height}
      on:pointerdown={startDragTranslate}
      on:pointerup={endDragTranslate}
    />
  {/if}
  <slot />
</g>

<style>
  .selectionArea {
    fill: purple;
    fill-opacity: 0.01;
    stroke: #000;
    stroke-width: 1px;
    stroke-dasharray: 6px 4px;
    stroke-opacity: 1;
  }
  .selectionArea:hover {
    cursor: move;
  }
</style>
