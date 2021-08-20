<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { TRACK_DISTANCE } from './config/constants';
  import Handle from './Handle.svelte';
  import type { Point } from './types';

  const dispatch = createEventDispatcher();

  export let point: Point;

  $: extensionPointsActive = false;

  const cx = point.x;
  const cy = point.y;

  const angle = point.connectAngle;

  const extensionPoint1: Point = {
    x: cx + Math.cos(angle) * TRACK_DISTANCE,
    y: cy + Math.sin(angle) * TRACK_DISTANCE,
    connectAngle: point.connectAngle,
    type: point.type,
    direction: point.direction,
  };

  const extensionPoint2: Point = {
    x: cx - Math.cos(angle) * TRACK_DISTANCE,
    y: cy - Math.sin(angle) * TRACK_DISTANCE,
    connectAngle: point.connectAngle,
    type: point.type,
    direction: point.direction,
  };

  function onKeydownRouter(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      extensionPointsActive = true;
    }
  }
  function onKeyupRouter(event: KeyboardEvent) {
    if (event.key === 'Alt') {
      extensionPointsActive = false;
    }
  }
  function connect(event: CustomEvent, point: Point) {
    event.stopPropagation();
    dispatch('connect', point);
  }
</script>

<svelte:window on:keydown={onKeydownRouter} on:keyup={onKeyupRouter} />

{#if extensionPointsActive}
  <Handle
    point={extensionPoint1}
    on:connect={(event) => connect(event, extensionPoint1)}
  />
{/if}
<Handle {point} on:connect={(event) => connect(event, point)} />
{#if extensionPointsActive}<Handle
    point={extensionPoint2}
    on:connect={(event) => connect(event, extensionPoint2)}
  />
{/if}
