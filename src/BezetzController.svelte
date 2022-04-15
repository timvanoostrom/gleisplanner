<script lang="ts">
  import { onDestroy } from 'svelte';
  import Button from './Button.svelte';
  import { isWithinRadius } from './helpers/geometry';
  import { blocksDB } from './store/blocks';
  import {
    getCoordString,
    gleisBezetz,
    gleisIdsActive,
    GleisLink,
    gleisPlanned,
    LinkedRoute,
    pointConnections,
  } from './store/gleis';
  import type { GleisPropsPlanned, PathSegmentProps, Point } from './types';

  function findPointByCoordString(points: Point[], str: string) {
    return points.find((p) => getCoordString(p) === str);
  }

  function getOpposingPointStrings(
    pathSegments: PathSegmentProps[],
    currentGleis: GleisPropsPlanned,
    curPoint: string
  ): string[] {
    function getRouteSegments(pathSegment: PathSegmentProps): string[] {
      const opposingpoints = pathSegment.points.filter((pointString) => {
        return pointString !== curPoint;
      });

      return opposingpoints.filter((pointString) => {
        const isPrimaryPoint = ['c1', 'c2'].includes(
          findPointByCoordString(currentGleis.points, pointString)?.type
        );

        const [x1, y1] = curPoint.split(',').map((s) => parseInt(s, 10));
        const [x2, y2] = pointString.split(',').map((s) => parseInt(s, 10));

        return (
          isPrimaryPoint &&
          !isWithinRadius({ x: x1, y: y1 }, { x: x2, y: y2 }, 100)
        );
      });
    }

    const connectingRouteSegments =
      pathSegments.flatMap((pathSegment) => {
        return getRouteSegments(pathSegment);
      }) || [];

    return connectingRouteSegments;
  }

  function findRoutesToAvailableBlock(
    gleisId: GleisPropsPlanned['id'],
    curPoint: string,
    routeGleisGleisLinks: LinkedRoute = []
  ): LinkedRoute[] {
    const currentGleis: GleisPropsPlanned = $gleisPlanned[gleisId];

    const [, , fromPoint = '', fromGleis = null] =
      routeGleisGleisLinks[routeGleisGleisLinks.length - 1] || [];
    // 'connectedAt.' + currentGleis.type + '.' + pathSegment.gleisType
    routeGleisGleisLinks.push([fromPoint, fromGleis, curPoint, currentGleis]);

    const mainSegments = currentGleis.pathSegments?.filter(
      (segment) => segment.type === 'main'
    );

    const opposingPointStrings = getOpposingPointStrings(
      mainSegments,
      currentGleis,
      curPoint
    );

    // Select all connected gleis
    const connectedGleis = opposingPointStrings.map((toPoint) => {
      // NOTE: Takes first found gleis but when we have multiple gleis in various layers
      // mounted at the same point, which do we taken? Maybe we should introduce an extra element
      // a sort-of-bridge-layer-connection-type
      const [toGleis]: GleisPropsPlanned[] = $pointConnections[toPoint]
        ?.filter((id) => id !== gleisId)
        .map((id) => $gleisPlanned[id]);

      return [curPoint, currentGleis, toPoint, toGleis] as GleisLink;
    });

    if (!connectedGleis.length) {
      // dead end friends??
      console.log('dead endZZ');
      return [];
    }

    // Check if gleis are in blocks and are not occupied.
    const blockCandidates = connectedGleis.filter(
      ([fromPoint, fromGleis, toPoint, toGleis]) => {
        return !!toGleis.blockId && !$blocksDB[toGleis.blockId].occupied;
      }
    );

    // Candidates without block
    const connectionCandidates = connectedGleis.filter(
      ([fromPoint, fromGleis, toPoint, toGleis]) => {
        return !toGleis.blockId;
      }
    );

    const routes: LinkedRoute[] = [];

    for (const candidateGleisLink of blockCandidates) {
      // TODO: Push all gleisID's in this block (via getAllGleisIdsInBlock(candidate.blockId))
      routes.push([...routeGleisGleisLinks, candidateGleisLink]);
    }

    for (const [
      fromPoint,
      fromGleis,
      toPoint,
      toGleis,
    ] of connectionCandidates) {
      const otherRoutes = findRoutesToAvailableBlock(
        toGleis.id,
        toPoint,
        routeGleisGleisLinks
      );

      if (otherRoutes) {
        routes.push(...otherRoutes);
      }
    }

    return routes;
  }

  /**
   * 1. Select gleis/point to start from
   *  - find adjacent point(s)
   *  - get connected gleis at points
   * 2. Find next suitable block(s)
   * 3. Gather gleis/segment(s) to first gleis of suitable block
   * 4. Repeat
   * @param gleisById
   * @param connectionsByCoordString
   * @param startAtId
   */

  function* runSimulation(gleisId: GleisPropsPlanned['id']) {
    gleisBezetz.set([]);
    let gleis = $gleisPlanned[gleisId];
    // TODO: Decide which point to get here.
    let [point, point2] =
      gleis.pathSegments.find((s) => s.type === 'main')?.points || [];

    while (true) {
      const routes = findRoutesToAvailableBlock(gleisId, point2);
      if (!routes.length) {
        return;
      }
      yield routes;
    }
  }

  let simulation: Generator<LinkedRoute[], void, unknown> = null;
  let unsubscribe;

  function nextStep() {
    if (!simulation) {
      const startAtId = $gleisIdsActive[0];
      if (startAtId) {
        simulation = runSimulation(startAtId);
      } else {
        alert('Select start gleis');
        return;
      }
    }

    // Call next
    const nextBezetz = simulation.next();

    if (nextBezetz.value) {
      const bezetz = [nextBezetz.value[0]];
      gleisBezetz.set(bezetz);
    } else {
      stopSimulation();
    }
  }

  function prevStep() {}

  export function stopSimulation() {
    if (simulation) {
      // alert('Simulation stopped.');
      simulation?.return();
      // gleisBezetz.set({});
      simulation = null;
    }
  }

  onDestroy(() => {
    unsubscribe?.();
    stopSimulation();
  });
</script>

<!-- <svelte:window on:keydown={onKeydownRouter} on:keyup={onKeyupRouter} /> -->

<!-- <Button>&laquo; prev</Button> -->
<!-- <Button on:click={() => prevStep()}>&laquo; prev</Button> -->
<Button on:click={() => nextStep()}>next &raquo;</Button>
