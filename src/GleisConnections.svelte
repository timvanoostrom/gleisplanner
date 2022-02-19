<script lang="ts">
  import ExtendHandles from './ExtendHandles.svelte';
  import GleisConnectKeyboardControl from './GleisConnectKeyboardControl.svelte';
  import Handle from './Handle.svelte';
  import { connectFlex, connectFlexPointStart } from './helpers/flex';
  import {
    connectGleis,
    getCoordString,
    gleisIdsActive,
    gleisPlanned as gleisPlannedBbyId,
    pointConnections,
    protoGleisActive,
  } from './store/gleis';

  import type { GleisPropsPlanned, Point, ProtoSegmentFlex } from './types';

  export let gleisPlanned: GleisPropsPlanned[] = [];
  export let selectionMode: boolean = false;

  function connectGleisToPoint(
    event: CustomEvent | MouseEvent,
    pointOrigin: Point
  ) {
    const { root, ...pointOriginProps } = pointOrigin;

    if ($protoGleisActive.type === 'Flex') {
      if (!$connectFlexPointStart) {
        connectFlexPointStart.set({ ...pointOriginProps });
      } else {
        const protoSegment = $protoGleisActive.segments[0] as ProtoSegmentFlex;
        connectFlex(pointOriginProps, protoSegment);
      }
    } else {
      console.log('pointOriginProps', pointOriginProps);
      connectGleis({
        pointOrigin: { ...pointOriginProps },
      });
    }
  }

  function gleisPoints(gleisProps: GleisPropsPlanned) {
    const points = gleisProps.points.filter((p) => {
      const connectedIDs = $pointConnections[getCoordString(p)]?.filter(
        (id) => {
          return (
            $gleisPlannedBbyId[id]?.layerId === gleisProps.layerId &&
            id !== gleisProps.id
          );
        }
      );

      return (
        p.type === 'c1' ||
        (p.type === 'c2' &&
          (!connectedIDs ||
            connectedIDs.length <= 1 ||
            connectedIDs.some((id) => $gleisIdsActive.includes(id)))) // endpoint
      );
    });

    return points;
  }
</script>

<g class="GleisConnections">
  {#each gleisPlanned as gleisProps (gleisProps.id)}
    {#if $gleisIdsActive.includes(gleisProps.id)}
      {#each gleisPoints(gleisProps) as point (point)}
        <ExtendHandles
          {point}
          on:connect={(event) => connectGleisToPoint(event, event.detail)}
        />
      {/each}
    {:else}
      {#each gleisPoints(gleisProps) as point (point)}
        <Handle
          {point}
          label={point.type}
          on:connect={(event) => connectGleisToPoint(event, event.detail)}
        />
      {/each}
    {/if}
  {/each}
  {#if selectionMode}
    <GleisConnectKeyboardControl onConnect={connectGleisToPoint} />
  {/if}
</g>

<style>
  .GleisConnections {
  }
</style>
