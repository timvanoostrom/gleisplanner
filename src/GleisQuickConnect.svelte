<script lang="ts">
  import { gleisIdsActive, gleisPlannedSelected } from './store/gleis';

  import { activeLayer } from './store/layerControl';
  import type { Point } from './types';

  export let onConnect: (event: CustomEvent | MouseEvent, point: Point) => void;

  $: firstActiveGleis = $gleisPlannedSelected[0];

  function onKeydownRouter(event) {
    if (
      firstActiveGleis.layerId !== $activeLayer.id ||
      !firstActiveGleis ||
      $gleisIdsActive.length > 1
    ) {
      return;
    }
    if (firstActiveGleis.type !== 'Flex') {
      const [p1, p2] = firstActiveGleis.points;
      switch (event.key) {
        case 'ArrowRight':
          if (!event.shiftKey) {
            const point = p2;
            if (point) {
              onConnect(event, point);
            }
          }
          break;
        case 'ArrowLeft':
          if (!event.shiftKey) {
            const point = p1;
            if (point) {
              onConnect(event, point);
            }
          }
          break;
        default:
          break;
      }
    }
  }
</script>

<svelte:window on:keydown={onKeydownRouter} />
