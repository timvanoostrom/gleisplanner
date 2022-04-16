<script lang="ts">
  import { onDestroy } from 'svelte';
  import Button from './Button.svelte';
  import { generateID } from './helpers/app';
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
  import type {
    GleisPlanned,
    GleisPropsPlanned,
    PathSegmentProps,
    Point,
  } from './types';

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

  function findRoutes(fromId: GleisPropsPlanned['id']) {
    let gleis = $gleisPlanned[fromId];
    // TODO: Decide which point to get here.
    let [point, point2] =
      gleis.pathSegments.find((s) => s.type === 'main')?.points || [];

    const routes = findRoutesToAvailableBlock(gleis.id, point2);

    return routes;
  }

  let simulation: Generator<number, void, unknown> = null;
  let unsubscribe;
  let isSimulationStarted: boolean = false;
  let activeRoute: LinkedRoute = [];
  let routes: LinkedRoute[] = [];
  let routeId: string = '';

  function nextStep() {
    if (!isSimulationStarted) {
      const startAtId = $gleisIdsActive[0];

      routes = findRoutes(startAtId);

      console.log('found routes', routes);

      if (!routes.length) {
        alert('Cannot start route, no route to available block found.');
      } else {
        activeRoute = routes[0];
        routeId = generateID();

        gleisBezetz.update((bezetzRoutes) => {
          bezetzRoutes[routeId] = {
            route: activeRoute,
            activeLinkIndex: 0,
          };
          return bezetzRoutes;
        });

        isSimulationStarted = true;
      }
    } else {
      gleisBezetz.update((bezetzRoutes) => {
        let { activeLinkIndex, route } = bezetzRoutes[routeId];
        if (!route[activeLinkIndex + 1]) {
          activeLinkIndex = 0;
        } else {
          activeLinkIndex++;
        }
        bezetzRoutes[routeId].activeLinkIndex = activeLinkIndex;
        return bezetzRoutes;
      });
    }
  }

  function prevStep() {}

  export function stopSimulation() {
    gleisBezetz.set({});
    console.log('Simulation stopped.');
    isSimulationStarted = false;
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
