<script lang="ts">
  import debounce from 'lodash.debounce';

  import { createEventDispatcher, tick } from 'svelte';
  import type { Readable } from 'svelte/store';
  import { toRad, getBBox } from './helpers/geometry';
  import type { GleisPropsPlanned } from './types';

  export let gleisSelected: Readable<GleisPropsPlanned[]>;

  const dispatch = createEventDispatcher();

  let transformHost: SVGGeometryElement;
  let rotationPoint = { x: 0, y: 0, angle: 0 };
  let prevRotation = 0;

  $: rotationTransform = `rotate(${rotationPoint.angle} ${rotationPoint.x} ${rotationPoint.y})`;

  gleisSelected.subscribe(async () => {
    await tick();
    resetRotation();
    setRotationCenter();
  });

  function setRotationCenter() {
    const { height, width, minX, minY } = getBBox(
      $gleisSelected.flatMap(({ points }) =>
        points.filter((p) => p.type !== 'cc')
      )
    );
    rotationPoint.x = minX + width / 2;
    rotationPoint.y = minY + height / 2;
  }

  function resetRotation() {
    rotationPoint.angle = 0;
    prevRotation = 0;
  }

  function saveRotation() {
    dispatch('done', {
      angle: toRad(rotationPoint.angle),
      host: transformHost,
    });
    resetRotation();
    isUnsaved = false;
  }

  const saveRotationDebounced = debounce(saveRotation, 400);
  $: isUnsaved = false;

  function onKeydownRouter(event: KeyboardEvent) {
    if (!event.metaKey) {
      switch (event.key) {
        case 'R':
        case 'r':
          if (
            (event.target as HTMLElement).tagName !== 'INPUT' &&
            (event.target as HTMLElement).tagName !== 'SELECT'
          ) {
            isUnsaved = true;
            event.preventDefault();
            let delta = 0.5;
            const rotationHitDelta = Date.now() - prevRotation;

            if (prevRotation !== 0 && rotationHitDelta < 200) {
              delta = 10;
            } else if (
              prevRotation !== 0 &&
              rotationHitDelta > 200 &&
              rotationHitDelta < 400
            ) {
              delta = 5;
            }
            if (event.shiftKey) {
              rotationPoint.angle -= delta;
            } else {
              rotationPoint.angle += delta;
            }
            prevRotation = Date.now();

            saveRotationDebounced();
          }
          break;

        case 'Escape':
          resetRotation();
          dispatch('done');
          break;
        case 'Enter':
          saveRotation();
          dispatch('done');
          break;
      }
    }
  }
</script>

<svelte:window on:keydown={onKeydownRouter} />

<g bind:this={transformHost} transform={rotationTransform}>
  {#if isUnsaved}
    <circle
      cx={rotationPoint.x}
      cy={rotationPoint.y}
      class="RotateCenter"
      r="175"
    />
  {/if}
  <slot />
</g>

<style>
  .RotateCenter {
    fill: #fff;
    fill-opacity: 0;
    stroke: #000;
    stroke-width: 1px;
    stroke-dasharray: 6px 4px;
    stroke-opacity: 1;
  }
</style>
