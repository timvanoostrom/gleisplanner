<script lang="ts">
  import { onDestroy } from 'svelte';
  import Button from './Button.svelte';
  import { generateID } from './helpers/app';
  import { isWithinRadius } from './helpers/geometry';
  import { findSegment } from './helpers/gleis';
  import { blocksDB } from './store/blocks';
  import {
    BezetzRoutes,
    getCoordString,
    gleisBezetz,
    gleisIdsActive,
    GleisLink,
    gleisPlanned,
    GLEIS_BEZETZ_DEFAULT,
    LinkedRoute,
    pointConnections,
    Route,
  } from './store/gleis';
  import type { GleisPropsPlanned, PathSegmentProps, Point } from './types';
  import { svgPathProperties } from 'svg-path-properties';
  import SVGPathCommander from 'svg-path-commander';

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
    routeGleisGleisLinks: LinkedRoute = [],
    routes: LinkedRoute[] = []
  ): LinkedRoute[] {
    const currentGleis: GleisPropsPlanned = $gleisPlanned[gleisId];

    const [, , fromPoint = '', fromGleis = null] =
      routeGleisGleisLinks[routeGleisGleisLinks.length - 1] || [];
    // 'connectedAt.' + currentGleis.type + '.' + pathSegment.gleisType
    routeGleisGleisLinks.push([fromPoint, fromGleis, curPoint, currentGleis]);

    const mainSegments = currentGleis.pathSegments?.filter(
      (segment) =>
        (segment.type === 'main' || segment.type === 'branch') &&
        segment.points.includes(curPoint)
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
    // .filter(([, from, , to]) => from.layerId === to?.layerId);

    // console.log('connected', curPoint, connectedGleis);
    // return [];

    if (!connectedGleis.length) {
      // dead end friends??
      console.log('dead endZZ');
      return [];
    }

    // Check if gleis are in blocks and are not occupied.
    const blockCandidates = connectedGleis.filter(
      ([fromPoint, fromGleis, toPoint, toGleis]) => {
        return !!toGleis?.blockId && !$blocksDB[toGleis.blockId].occupied;
      }
    );

    // Candidates without block
    const connectionCandidates = connectedGleis.filter(
      ([fromPoint, fromGleis, toPoint, toGleis]) => {
        return !!toGleis && !toGleis?.blockId;
      }
    );

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
      findRoutesToAvailableBlock(
        toGleis.id,
        toPoint,
        [...routeGleisGleisLinks],
        routes
      );
    }

    return routes;
  }

  function findRoutes(
    fromId: GleisPropsPlanned['id'],
    pointPredicate: (
      pointString: string,
      index: number,
      allPoints: string[]
    ) => boolean
  ) {
    const gleis = $gleisPlanned[fromId];
    const point = (
      gleis.pathSegments.find((s) => s.type === 'main')?.points || []
    ).find(pointPredicate);

    let routes = [];

    if (point) {
      routes = findRoutesToAvailableBlock(gleis.id, point);
    }

    return routes;
  }

  function combineLinksToPath(gleisLinks: GleisLink[]) {
    let path = '';
    let length = 0;

    const linksOrdered = [];
    const linkedList = [];

    for (const link of gleisLinks) {
      const [fromPoint, from, toPoint, to] = link;
      if (!fromPoint || !toPoint) {
        continue;
      }
      linkedList.push([
        fromPoint,
        toPoint,
        findSegment(from, fromPoint, toPoint),
      ]);
    }

    for (const link of linkedList) {
      let [fromPoint, toPoint, segment] = link;
      const sp = new svgPathProperties(segment);

      const [{ start }] = sp.getParts().filter((p) => p.length >= 1);

      if (fromPoint !== getCoordString(start)) {
        const path = new SVGPathCommander(segment, {});
        path.reverse();
        segment = path.toString();
      }

      length += sp.getTotalLength();
      path += segment;
    }

    return { path, length };
  }

  let simulation: Generator<number, void, unknown> = null;
  let unsubscribe;
  let isSimulationStarted: boolean = false;
  let routes: LinkedRoute[] = [];
  let routeId: string = '';

  function nextStep() {
    console.log('nextStep1!!');
    if (!isSimulationStarted) {
      const startAtId = $gleisIdsActive[0];

      const routes1 = findRoutes(
        startAtId,
        (pointString, index) => index === 0
      );
      // if (!routes.length) {
      const routes2 = findRoutes(
        startAtId,
        (pointString, index) => index === 1
      );
      // }

      routes = routes.concat(routes1, routes2);

      console.log('found routes', routes);

      if (!routes.length) {
        alert('Cannot start route, no route to available block found.');
      } else {
        // Remove starting link so route will activate next link first
        gleisBezetz.update((bezetz) => {
          const bezetzUpdated: BezetzRoutes = {
            routes: {},
            activeRouteId: '',
          };

          for (const routeLinks of routes) {
            routeLinks.shift();

            const pathCombined = combineLinksToPath(routeLinks);
            const route: Route = {
              id: generateID(),
              links: routeLinks,
              path: pathCombined?.path,
              length: pathCombined?.length,
            };

            bezetzUpdated.routes[route.id] = { route, activeLinkIndex: 0 };

            if (!bezetzUpdated.activeRouteId) {
              bezetzUpdated.activeRouteId = route.id;
            }
          }

          return bezetzUpdated;
        });

        isSimulationStarted = true;
      }
    } else {
      gleisBezetz.update((bezetz) => {
        let { activeLinkIndex, route } = bezetz.routes[bezetz.activeRouteId];
        if (!route.links[activeLinkIndex + 1]) {
          activeLinkIndex = 0;
        } else {
          activeLinkIndex++;
        }
        bezetz.routes[route.id].activeLinkIndex = activeLinkIndex;
        return bezetz;
      });
    }
  }

  function prevStep() {}

  export function stopSimulation() {
    gleisBezetz.set(GLEIS_BEZETZ_DEFAULT);
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
