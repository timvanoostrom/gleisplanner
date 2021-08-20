<script lang="ts">
  import { tick } from 'svelte';
  import type { Readable } from 'svelte/store';
  import { generateID } from './helpers/app';
  import { getBBox, normalizeAngle } from './helpers/geometry';
  import { applyMatrixToPoint } from './helpers/svg';
  import RotateGleis from './RotateGleis.svelte';
  import {
    setGleisIdsActive,
    updateGleis,
    updateGleisPlanned,
  } from './store/gleis';
  import { planeSvg } from './store/plane';
  import { isDragTranslateActive, isRotationActive } from './store/workspace';
  import FlipGleisConnection from './FlipGleisConnection.svelte';
  import TranslateGleis from './TranslateGleis.svelte';
  import type { GleisPropsPlanned, Point } from './types';

  export let gleisSelected: Readable<GleisPropsPlanned[]>;

  let selectionArea: Partial<DOMRect>;
  let addToSelection = false;

  gleisSelected.subscribe(async () => {
    // Wait here because latest transformation is not applied otherwise.
    await tick();
    setSelectionArea();
  });

  function setSelectionArea() {
    const points = $gleisSelected.flatMap((gleis) => {
      return gleis.points.filter((p) => p.type !== 'cc');
    });
    if (points.length) {
      const { height, width, minX, minY } = getBBox(points);
      selectionArea = {
        height,
        width,
        x: minX,
        y: minY,
      };
    }
  }

  function saveSelectionTransform(transformHost, rotateAngle: number = 0) {
    const gleisUpdates = [];

    $gleisSelected.forEach((gleisProps) => {
      const points = gleisProps.points.map(
        ({ x, y, connectAngle = 0, ...rest }) => {
          const pointTransformed = applyMatrixToPoint(
            $planeSvg,
            transformHost,
            {
              x,
              y,
            }
          );

          const pointUpdated: Point = {
            ...pointTransformed,
            connectAngle,
            ...rest,
          };

          if (rotateAngle !== 0) {
            // TODO: Check correctness of normalizeAngle
            pointUpdated.connectAngle = connectAngle + rotateAngle;
          }

          return pointUpdated;
        }
      );
      gleisUpdates.push({
        id: gleisProps.id,
        points,
      });
    });

    updateGleis(gleisUpdates);
  }

  function onKeyupRouter(event) {
    if (!event.shiftKey) {
      addToSelection = false;
    }
  }

  function onKeydownRouter(event) {
    if (event.shiftKey) {
      addToSelection = true;
    }
    switch (event.key) {
      case 'd':
        if (event.metaKey) {
          event.preventDefault();
          const duplicatedGleis = {};
          const idsSelected = [];
          for (const gleis of $gleisSelected) {
            const id = generateID();
            idsSelected.push(id);
            duplicatedGleis[id] = {
              ...gleis,
              id,
              points: gleis.points.map((point) => {
                return {
                  x: point.x + 100,
                  y: point.y + 100,
                };
              }),
            };
          }

          updateGleisPlanned((gleis) => {
            return {
              ...gleis,
              ...duplicatedGleis,
            };
          });
          setGleisIdsActive(idsSelected);
        }
        break;
    }
  }
</script>

<svelte:window on:keydown={onKeydownRouter} on:keyup={onKeyupRouter} />

<g id="selected-gleis">
  <RotateGleis
    on:done={(event) => {
      isRotationActive.set(false);
      if (event.detail?.host) {
        saveSelectionTransform(event.detail.host, event.detail?.angle || 0);
      }
    }}
    {gleisSelected}
  >
    <TranslateGleis
      {selectionArea}
      on:done={(event) => {
        if (event.detail?.host) {
          if (event.detail?.updates?.length) {
            updateGleis(event.detail.updates);
          } else {
            saveSelectionTransform(event.detail.host);
          }
        }
      }}
      {gleisSelected}
    >
      <slot />
    </TranslateGleis>
  </RotateGleis>

  {#if $gleisSelected.length >= 1}
    <FlipGleisConnection {gleisSelected} />
  {/if}
</g>

<style>
</style>
