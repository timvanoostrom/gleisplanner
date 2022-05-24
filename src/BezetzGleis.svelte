<script lang="ts">
  import Loco from './Loco.svelte';
  import { gleisBezetz } from './store/bezetz';
  import { locosDB, saveLocoAtPoint, startLoco, stopLoco } from './store/loco';
  import {
    getActiveRoute,
    hasNextSegment,
    isArrivedAtDestination,
    isNextSegmentAvailable,
    isNextSegmentOccupied,
  } from './store/routes';
  import { detectGleis } from './store/sections';
</script>

{#each Object.entries($gleisBezetz) as [locoID, gleisBezetz]}
  <Loco
    on:pointAt={({ detail: point }) => {
      detectGleis(locoID, point);
      const loco = $locosDB[locoID];
      const hasActiveRoute = !!getActiveRoute(locoID);
      const hasNextSegment_ = hasNextSegment(locoID);
      const isArrived = isArrivedAtDestination(locoID, point);

      switch (true) {
        case hasActiveRoute && isArrived:
          if (isArrived) {
            console.log('arrived!!', locoID);
          }
          stopLoco(locoID);
          saveLocoAtPoint(locoID, point);
          // TODO: Determine what to do next here..
          // resetRoutes(locoID);
          // reverseRouteDestination(locoID);
          break;
        case loco.velocity !== 0 &&
          hasActiveRoute &&
          hasNextSegment_ &&
          isNextSegmentOccupied(locoID):
          console.log('stop outside!', locoID);
          stopLoco(locoID, true);
          saveLocoAtPoint(locoID, point);
          break;
        case loco.velocity === 0 &&
          hasActiveRoute &&
          hasNextSegment_ &&
          isNextSegmentAvailable(locoID) &&
          $locosDB[locoID].isWaiting:
          startLoco(locoID);
          break;
        default:
          saveLocoAtPoint(locoID, point);
          break;
      }
    }}
    path={gleisBezetz.routes?.[gleisBezetz.activeRouteId]?.route.path || ''}
    loco={$locosDB[locoID]}
    endAtPoint={gleisBezetz.routes?.[gleisBezetz.activeRouteId]?.endAtPoint ??
      null}
  />
{/each}
