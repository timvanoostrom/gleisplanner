<script lang="ts">
  import throttle from 'lodash.throttle';
  import Loco from './Loco.svelte';
  import { gleisBezetz } from './store/gleis';
  import { planeSvg } from './store/plane';
  import {
    getBezetzSegment,
    resetRoutes,
    setLocoAtPoint,
    stopLoco,
  } from './store/sections';
  import { locosDB } from './store/workspace';
  import type { Point } from './types';

  function detectGleis(locoID: string, point: Point) {
    const isDetected = (pathSegment: string) => {
      const svgPoint = $planeSvg.createSVGPoint();
      const path = document.querySelector(`path[d="${pathSegment}"]`);

      svgPoint.x = point.x;
      svgPoint.y = point.y;

      return (path as SVGPathElement).isPointInStroke(svgPoint);
    };

    const locoRoutes = $gleisBezetz[locoID];
    const activeRoute = locoRoutes.routes[locoRoutes.activeRouteId];
    const { route, activeLinkIndex = 0 } = activeRoute;
    const nextActiveLinkIndex = activeLinkIndex + 1;
    const activePathSegments = activeRoute?.activePathSegments;

    if (activePathSegments?.length && isDetected(activePathSegments[0])) {
      return;
    }

    const pathSegment = getBezetzSegment(activeLinkIndex, route.links);
    const isDetected1 = isDetected(pathSegment);
    const pathSegment2 = getBezetzSegment(nextActiveLinkIndex, route.links);
    const pathSegments = [pathSegment, pathSegment2];

    gleisBezetz.update((bezetz) => {
      bezetz[locoID].routes[route.id].activeLinkIndex = !isDetected1
        ? nextActiveLinkIndex
        : activeLinkIndex;
      bezetz[locoID].routes[route.id].activePathSegments = pathSegments;
      return bezetz;
    });
  }

  function completeLocoRoute(locoID: string) {
    console.log('complete');

    const { destinationBlockID } = $gleisBezetz[locoID];

    resetRoutes(locoID, {
      departureBlockID: destinationBlockID,
      destinationBlockID: '',
    });

    stopLoco(locoID);
  }

  const saveLocoAtPoint = throttle(setLocoAtPoint, 400);

  // $: locosWithActiveRoute = Object.entries($gleisBezetz).filter(
  //   ([locoID]) => !!getActiveRoute(locoID)
  // );
  $: locos = Object.entries($gleisBezetz);
</script>

{#each locos as [locoID, gleisBezetz]}
  <Loco
    on:pointAt={({ detail: point }) => {
      detectGleis(locoID, point);
      saveLocoAtPoint(locoID, point);
    }}
    on:arrivedAt={({ detail: point }) => {
      completeLocoRoute(locoID);
    }}
    path={gleisBezetz.routes?.[gleisBezetz.activeRouteId]?.route.path || ''}
    loco={$locosDB[locoID]}
  />
{/each}
