<script lang="ts">
  import {
    afterUpdate,
    beforeUpdate,
    createEventDispatcher,
    onDestroy,
  } from 'svelte';
  import { svgPathProperties } from 'svg-path-properties';
  import type SVGPathProperties from 'svg-path-properties/dist/types/svg-path-properties';
  import { isWithinRadius } from './helpers/geometry';
  import { getCoordString } from './store/gleis';
  import type { Loco } from './store/sections';
  import type { Point } from './types';

  export let loco: Loco = null;
  export let path: string = '';
  export let endAtPoint: Point = null;

  const dispatch = createEventDispatcher();

  function findLengthAtPoint(path: typeof pathProps, point: Point) {
    const pathLength = path.getTotalLength();
    let atLength = 0;

    for (atLength; atLength < pathLength; atLength += 20) {
      const pointAtLength = path.getPointAtLength(atLength);
      if (isWithinRadius(pointAtLength, point, 20)) {
        return atLength;
      }
    }
    return 0;
  }

  $: pathProps = path ? new svgPathProperties(path) : null;
  $: atPoint = null;
  $: pathLength = pathProps?.getTotalLength() ?? 0;

  let endAtPointPathLength = pathLength;
  let animationRequestID = null;
  let pollingRequestID = null;
  let curLength = 0;
  let segLength = 0;
  let startedAtPoint = null;
  let startedAtPath = null;
  let currentSpeed = 0;

  function destroyAnimationRequestID() {
    cancelAnimationFrame(animationRequestID);
    animationRequestID = null;
  }

  function destroyPollingRequestID() {
    clearTimeout(pollingRequestID);
    pollingRequestID = null;
  }

  function reset() {
    curLength = 0;
    segLength = 0;
    destroyAnimationRequestID();
  }

  function moveLoco() {
    // The request could already be pending. If in the meanwhile the pathProps are removed
    // we'd crash!
    if (pathProps && curLength < endAtPointPathLength) {
      segLength = 10;
      // TODO: vertraging?
      // if (curLength > 10000 && curLength < 14000) {
      //   segLength = pathLength / Math.max(1000 + (sdt += 1) * 50, 3000);
      // }

      curLength += segLength;
      atPoint = pathProps.getPointAtLength(curLength);
      dispatch('pointAt', atPoint as Point);

      animationRequestID = requestAnimationFrame(moveLoco);
    } else if (pathProps) {
      // Dispatch last point of path
      dispatch('pointAt', endAtPoint);
    }
  }

  function dispatchPosition() {
    // console.log('dispatch', loco.id);
    dispatch('pointAt', atPoint as Point);
    pollingRequestID = setTimeout(() => {
      dispatchPosition();
    }, 800);
  }

  $: {
    // If the loco was placed at a different point, use it.
    const locoAtPointString = loco.atPoint
      ? getCoordString(loco.atPoint)
      : null;
    const isPathChanged = path !== startedAtPath;

    if (isPathChanged) {
      startedAtPath = path;
      curLength =
        pathProps && loco.atPoint
          ? findLengthAtPoint(pathProps, loco.atPoint)
          : 0;
      destroyAnimationRequestID();
      endAtPointPathLength = endAtPoint
        ? findLengthAtPoint(pathProps, endAtPoint)
        : pathLength;
    }

    if (
      (locoAtPointString && locoAtPointString !== startedAtPoint) ||
      isPathChanged
    ) {
      startedAtPoint = locoAtPointString;
      atPoint = loco.atPoint;
    }
  }

  $: {
    if (pathProps && loco.velocity !== 0 && !animationRequestID) {
      console.log('start!', loco.id, pathProps, loco.velocity);
      destroyPollingRequestID();
      moveLoco();
    } else if (pathProps && loco.velocity === 0 && animationRequestID) {
      console.log('stop!', loco.id);
      destroyAnimationRequestID();

      destroyPollingRequestID();
      dispatchPosition();
    } else if (pollingRequestID) {
    }
  }

  // $: {
  //   if (animationRequestID && loco.velocity === 0) {
  //     console.log('Loco: stop', loco.id, loco.velocity);
  //     stop();
  //   }

  //   if (pathSelected && prevPath !== pathSelected) {
  //     console.log('Loco: reset', loco.id);
  //     reset();
  //     pathProps = new svgPathProperties(pathSelected);
  //     pathLength = pathProps.getTotalLength();
  //     prevPath = pathSelected;
  //   }

  //   if (!curLength && loco.atPoint && pathProps) {
  //     console.log('Loco: find cur leng', loco.id);
  //     curLength = findLengthAtPoint(pathProps, loco.atPoint, pathLength);
  //   }

  //   if (!loco.atPoint) {
  //     p = null;
  //     console.log('Loco: destroy p', loco.id);
  //   } else if (loco.atPoint && !pathProps) {
  //     p = loco.atPoint;
  //     console.log('Loco: put at p', loco.id);
  //   }

  //   if (!animationRequestID && loco.velocity !== 0 && pathProps) {
  //     moveLoco();
  //   }
  // }

  onDestroy(() => {
    // stop();
    // reset();
    console.log('on blap!', loco.id);
    destroyAnimationRequestID();
    destroyPollingRequestID();
  });
</script>

{#if atPoint}
  <circle r="25" fill={loco.color} cx={atPoint.x} cy={atPoint.y} />
{/if}
