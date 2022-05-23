<script lang="ts">
  import throttle from 'lodash.throttle';
  import { jsonCopy } from './helpers/app';
  import Loco from './Loco.svelte';
  import { planeSvg } from './store/plane';
  import {
    getBezetzSegment,
    setLocoAtPoint,
    stopLoco,
    locosDB,
    gleisBezetz,
    activeLinkRegistry,
    getActiveRoute,
    resetRoutes,
    startLoco,
    getNextGleisId,
  } from './store/sections';
  import type { Point } from './types';

  function isPointDetected(pathSegment: string, point: Point) {
    const svgPoint = $planeSvg.createSVGPoint();
    const path = document.querySelector(`path[d="${pathSegment}"]`);

    if (!path) {
      return false;
    }

    svgPoint.x = point.x;
    svgPoint.y = point.y;

    return (path as SVGPathElement).isPointInStroke(svgPoint);
  }

  function isArrivedAtDestination(locoID: string, point: Point) {
    const activeRoute = getActiveRoute(locoID);
    const { endAtPoint } = activeRoute;
    return point.x === endAtPoint.x && point.y === endAtPoint.y;
  }

  function isNextSegmentOccupied(locoID: string) {
    const gleisID = getNextGleisId(locoID);
    if (gleisID) {
      return Object.entries($activeLinkRegistry).some(
        ([locoID, { currentID }]) => currentID === gleisID
      );
    }
    return true;
  }

  function isNextSegmentAvailable(locoID: string) {
    return !isNextSegmentOccupied(locoID);
  }

  function detectGleis(locoID: string, point: Point) {
    const locoRoutes = $gleisBezetz[locoID];
    const activeRoute = locoRoutes.routes[locoRoutes.activeRouteId];

    // TODO: Escape scenario?
    if (!activeRoute) {
      stopLoco(locoID);
      return;
    }

    const { route, activeLinkIndex = 0 } = activeRoute;
    const nextActiveLinkIndex = activeLinkIndex + 1;
    const pathSegment = getBezetzSegment(activeLinkIndex, route.links);

    if (!pathSegment) {
      console.log('path not detected. End of route???');
      return;
    }

    // Geeft de loco nog steeds een positie door behorend bij de actieve rail sectie?
    const isDetected1 = isPointDetected(pathSegment, point);
    // De volgende railsectie
    const pathSegment2 = getBezetzSegment(nextActiveLinkIndex, route.links);
    // 2 bezette railsecties
    const pathSegments = [pathSegment];

    if (pathSegment2) {
      pathSegments.push(pathSegment2);
    }

    // Als de loco niet gedetecteerd is, reserveren we nog niet een volgende sectie
    const activeLinkIndexUpdated = !isDetected1
      ? nextActiveLinkIndex
      : activeLinkIndex;

    gleisBezetz.update((bezetz) => {
      bezetz[locoID].routes[route.id].activeLinkIndex = activeLinkIndexUpdated;
      bezetz[locoID].routes[route.id].activePathSegments = pathSegments;
      return bezetz;
    });
  }

  function reverseRouteDestination(locoID: string) {
    gleisBezetz.update((gleisBezetz) => {
      const a = gleisBezetz[locoID];
      const { departureBlockID = '', destinationBlockID = '' } = a;
      a.destinationBlockID = departureBlockID;
      a.departureBlockID = destinationBlockID;
      return gleisBezetz;
    });
  }

  const saveLocoAtPoint = throttle(setLocoAtPoint, 400);

  $: locos = Object.entries($gleisBezetz);
  $: locoWaiting = {};
</script>

{#each locos as [locoID, gleisBezetz]}
  <Loco
    on:pointAt={({ detail: point }) => {
      detectGleis(locoID, point);

      const hasActiveRoute = !!getActiveRoute(locoID);

      switch (true) {
        case hasActiveRoute && isArrivedAtDestination(locoID, point):
          console.log('arrived!!', locoID);
          stopLoco(locoID);
          saveLocoAtPoint(locoID, point);
          // TODO: Determine what to do next here..
          resetRoutes(locoID);
          break;
        case hasActiveRoute && isNextSegmentOccupied(locoID):
          stopLoco(locoID, true);
          saveLocoAtPoint(locoID, point);
          break;
        case hasActiveRoute &&
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
