<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { xlink_attr } from 'svelte/internal';
  import { svgPathProperties } from 'svg-path-properties';
  import { createEventDispatcher } from 'svelte';
  import type { Point } from './types';

  export let path: string = '';

  const dispatch = createEventDispatcher();

  $: p = null;

  let interval = null;
  let pathProps = null;
  let pathLength = 0;
  let curLength = 0;
  let segLength = 0;

  onMount(() => {
    if (!interval) {
      pathProps = new svgPathProperties(path);
      pathLength = pathProps.getTotalLength();

      let sdt = 0;

      interval = setInterval(() => {
        segLength = 10;
        // if (curLength > 10000 && curLength < 14000) {
        //   segLength = pathLength / Math.max(1000 + (sdt += 1) * 50, 3000);
        // }
        if (curLength >= pathLength) {
          curLength = 0;
        } else {
          p = pathProps.getPointAtLength(curLength);
          curLength += segLength;
          dispatch('pointAt', p as Point);
        }
      }, 16.6);
    }
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

{#if p}
  <circle r="25" fill="red" cx={p.x} cy={p.y} />
{/if}
