<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { xlink_attr } from 'svelte/internal';
  import { svgPathProperties } from 'svg-path-properties';
  import { createEventDispatcher } from 'svelte';
  import type { Point } from './types';
  import type { Loco } from './store/workspace';
  import type SVGPathProperties from 'svg-path-properties/dist/types/svg-path-properties';
  import { isWithinRadius } from './helpers/geometry';

  export let loco: Loco = null;
  export let path: string = '';

  const dispatch = createEventDispatcher();

  $: p = null;
  $: pathSelected = path;

  let prevPath: string = '';
  let interval = null;
  let pathProps = null;
  let pathLength = 0;
  let curLength = 0;
  let segLength = 0;

  function stop() {
    cancelAnimationFrame(interval);
    interval = null;
  }

  function reset() {
    pathProps = null;
    pathLength = 0;
    curLength = 0;
    segLength = 0;
    prevPath = '';
  }

  function findLengthAtPoint(
    path: SVGPathProperties,
    point: Point,
    pathLength: number
  ) {
    let atLength = 0;
    for (atLength; atLength < pathLength; atLength += 20) {
      const pointAtLength = path.getPointAtLength(atLength);
      if (isWithinRadius(pointAtLength, point, 20)) {
        return atLength;
      }
    }
    return 0;
  }

  function moveLoco() {
    segLength = 20;
    // TODO: vertraging?
    // if (curLength > 10000 && curLength < 14000) {
    //   segLength = pathLength / Math.max(1000 + (sdt += 1) * 50, 3000);
    // }
    p = pathProps.getPointAtLength(curLength);

    if (curLength >= pathLength) {
      curLength = 0;
      clearInterval(interval);
      dispatch('arrivedAt', p as Point);
    } else {
      curLength += segLength;
      dispatch('pointAt', p as Point);
    }

    interval = requestAnimationFrame(moveLoco);
  }

  $: {
    if (loco.velocity === 0 || prevPath !== pathSelected) {
      stop();
    }

    if (pathSelected && prevPath !== pathSelected) {
      reset();
      pathProps = new svgPathProperties(pathSelected);
      pathLength = pathProps.getTotalLength();
      prevPath = pathSelected;
    }

    if (!curLength && loco.atPoint && pathProps) {
      curLength = findLengthAtPoint(pathProps, loco.atPoint, pathLength);
    }

    if (!loco.atPoint) {
      p = null;
    } else if (loco.atPoint && !pathProps) {
      p = loco.atPoint;
    }

    if (!interval && loco.velocity !== 0 && pathProps) {
      moveLoco();
    }
  }

  onDestroy(() => {
    stop();
    reset();
    console.log('on blap!');
  });
</script>

{#if p}
  <circle r="25" fill="red" cx={p.x} cy={p.y} />
{/if}
