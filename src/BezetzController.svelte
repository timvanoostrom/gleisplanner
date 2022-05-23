<script lang="ts">
  import { onDestroy } from 'svelte';
  import SVGPathCommander from 'svg-path-commander';
  import { svgPathProperties } from 'svg-path-properties';
  import Button from './Button.svelte';
  import ControlMenuPanel from './ControlMenuPanel.svelte';
  import { generateID, jsonCopy } from './helpers/app';
  import { isWithinRadius } from './helpers/geometry';
  import { findSegment } from './helpers/gleis';
  import {
    getCoordString,
    gleisPlanned,
    pointConnections,
    setControlGleisIdsActive,
    setControlGleisIdsActive_,
  } from './store/gleis';
  import {
    blocksBySectionId,
    blocksDB,
    clearRouteDestination,
    getActiveRoute,
    getBezetzSegment,
    gleisBezetz,
    gleisByBlockId,
    GleisLink,
    GLEIS_LOCO_ROUTES_DEFAULT,
    LinkedRoute,
    Loco,
    locosDB,
    previewControlRoute,
    resetRoutes,
    Route,
    setActiveRouteId,
    setLocoAtPoint,
    startLoco,
    stopLoco,
  } from './store/sections';
  import type { GleisPropsPlanned, PathSegmentProps, Point } from './types';

  function findPointByCoordString(points: Point[], str: string) {
    return points.find((p) => getCoordString(p) === str);
  }

  function getOpposingPointStrings(
    pathSegments: PathSegmentProps[],
    currentGleis: GleisPropsPlanned,
    curPoint: string
  ): string[] {
    function getPoints(pathSegment: PathSegmentProps): string[] {
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

    const points =
      pathSegments.flatMap((pathSegment) => {
        return getPoints(pathSegment);
      }) || [];

    return points;
  }

  function findRoutesToAvailableSection(
    gleisId: GleisPropsPlanned['id'],
    curPoint: string,
    routeGleisGleisLinks: LinkedRoute = [],
    routes: LinkedRoute[] = [],
    depth: number,
    destinationBlockID?: string,
    pointsCovered?: string[]
  ): LinkedRoute[] {
    const currentGleis: GleisPropsPlanned = $gleisPlanned[gleisId];

    // Take previous point/gleis
    const [, , fromPoint = '', fromGleis = null] =
      routeGleisGleisLinks[routeGleisGleisLinks.length - 1] || [];

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

    // console.log('opposingPointStrings', opposingPointStrings);

    if (!opposingPointStrings.length) {
      return [];
    }

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
      console.log('dead endZZ at', currentGleis);
      return [];
    }

    const blockCandidateFilterPredicate = destinationBlockID
      ? ([fromPoint, fromGleis, toPoint, toGleis]) => {
          const hasSectionId = !!toGleis?.sectionId;

          if (!hasSectionId) {
            return false;
          }

          const blockId = $blocksBySectionId?.[toGleis.sectionId]?.id;
          return hasSectionId && blockId === destinationBlockID;
        }
      : ([fromPoint, fromGleis, toPoint, toGleis]) => {
          return (
            !!toGleis?.sectionId &&
            !$blocksBySectionId?.[toGleis.sectionId].occupied
          );
        };

    // Check if gleis are in blocks and are not occupied.
    let blockCandidates = connectedGleis.filter(blockCandidateFilterPredicate);

    // Candidates without section
    const connectionCandidates = connectedGleis.filter(
      ([fromPoint, fromGleis, toPoint, toGleis]) => {
        return (
          !!toGleis &&
          (!toGleis?.sectionId ||
            (!!toGleis?.sectionId &&
              $blocksBySectionId?.[toGleis.sectionId].id !==
                destinationBlockID))
        );
      }
    );

    for (const candidateGleisLink of blockCandidates) {
      // TODO: Push all gleisID's in this section (via getAllGleisIdsInSection(candidate.blockId))
      const [, , fromPoint, fromGleis] = candidateGleisLink;

      // Select opposite point of destination gleis
      const toPoint = fromGleis.pathSegments
        .find((p) => p.type === 'branch' || p.type === 'main')
        ?.points?.find((p) => p !== fromPoint);

      const candidateGleisEndpoint: GleisLink = [
        fromPoint,
        fromGleis,
        toPoint,
        null,
      ];

      routes.push([
        ...routeGleisGleisLinks,
        candidateGleisLink,
        candidateGleisEndpoint,
      ]);
    }

    for (const [
      fromPoint,
      fromGleis,
      toPoint,
      toGleis,
    ] of connectionCandidates) {
      let pointsCoveredCopy = [...pointsCovered];
      if (!pointsCovered.includes(fromPoint + toPoint)) {
        pointsCoveredCopy.push(fromPoint + toPoint);
      } else {
        continue;
      }

      findRoutesToAvailableSection(
        toGleis.id,
        toPoint,
        [...routeGleisGleisLinks],
        routes,
        depth + 1,
        destinationBlockID,
        pointsCoveredCopy
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
    ) => boolean,
    destinationBlockID?: string
  ) {
    const gleis = $gleisPlanned[fromId];
    const point = (
      gleis.pathSegments.find((s) => s.type === 'main')?.points || []
    ).find(pointPredicate);

    let routes = [];

    if (point) {
      routes = findRoutesToAvailableSection(
        gleis.id,
        point,
        [],
        [],
        0,
        destinationBlockID,
        []
      );
    }

    return routes;
  }

  function determineEndAtPoint(loco: Loco, segment: string) {
    const path = new svgPathProperties(segment);
    const pathLength = path.getTotalLength();
    const locoLength = loco.length ?? 0;
    const margin = (pathLength - locoLength) / 2;
    return path.getPointAtLength(pathLength - margin);
  }

  function getPathLinks(gleisLinks: GleisLink[]) {
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
        (path as any).reverse();
        segment = path.toString();
      }

      length += sp.getTotalLength();
      path += segment;
    }

    return { path, length, segments: linkedList };
  }

  let unsubscribe;

  function getPointAtDepartureBlock(departureBlockID: string) {
    // console.log(departureBlockID, $gleisByBlockId?.[departureBlockID]);
    const blockPath = $gleisByBlockId?.[departureBlockID]
      ?.map(
        (gleis) =>
          gleis.pathSegments
            .find((segment) => segment.type === 'main')
            ?.d.toString() || ''
      )
      .join('');

    const pathProps = new svgPathProperties(blockPath);
    const atPoint = pathProps.getPointAtLength(pathProps.getTotalLength() / 2);

    return atPoint;
  }

  function generateRoutes(
    loco: Loco,
    departureBlockID: string,
    destinationBlockID?: string
  ) {
    setControlGleisIdsActive_([]);

    const departureGleisID = $gleisByBlockId?.[departureBlockID]?.[0]?.id;

    const routes1 = findRoutes(
      departureGleisID,
      (pointString, index) => index === 0,
      destinationBlockID
    );

    const routes2 = findRoutes(
      departureGleisID,
      (pointString, index) => index === 1,
      destinationBlockID
    );

    const routes: LinkedRoute[] = [...routes1, ...routes2];

    if (!routes.length) {
      alert('Cannot generate route, no route to destination section found.');
    } else {
      const routesGenerated = {};

      for (const routeLinks of routes) {
        const pathLinks = getPathLinks(routeLinks);

        const route: Route = {
          id: generateID(),
          links: routeLinks,
          path: pathLinks?.path,
          length: pathLinks?.length,
        };

        const lastSegment =
          pathLinks.segments[pathLinks.segments.length - 1][2];

        routesGenerated[route.id] = {
          route,
          activeLinkIndex: 0,
          activePathSegments: [],

          // TODO: endAtPoint could be determined by a signal or generated based on train length / type / user input etc.
          endAtPoint: determineEndAtPoint(loco, lastSegment),
        };
      }

      gleisBezetz.update((bezetzUpdated) => {
        const l = bezetzUpdated[loco.id] || jsonCopy(GLEIS_LOCO_ROUTES_DEFAULT);
        return {
          ...bezetzUpdated,
          [loco.id]: {
            ...l,
            routes: routesGenerated,
            activeRouteId: Object.keys(routesGenerated)[0] ?? '',
          },
        };
      });
    }
  }

  function resetPreview() {
    previewControlRoute.set([]);
  }

  function previewRoute(locoID: string, routeID: string) {
    setControlGleisIdsActive([]);

    const links = getActiveRoute(locoID).route.links;
    const segments = [];

    links.forEach((link, index) => {
      segments.push(getBezetzSegment(index, links));
    });

    previewControlRoute.set(segments);
    // setControlGleisIdsActive(ids);
  }

  function setLocoPoint(locoID: string) {
    const point =
      $gleisBezetz[locoID].departureBlockID === null
        ? null
        : getPointAtDepartureBlock($gleisBezetz[locoID].departureBlockID);
    console.log('Set-loco-at-point', locoID, point);
    return setLocoAtPoint(locoID, point);
  }

  function stopAll() {
    Object.entries($gleisBezetz).forEach(([locoID]) => {
      stopLoco(locoID);
    });
  }

  function startAll() {
    Object.entries($gleisBezetz)
      .filter(([locoID, { activeRouteId }]) => !!activeRouteId)
      .forEach(([locoID]) => {
        startLoco(locoID);
      });
  }

  function resetAll() {
    resetPreview();

    Object.entries($gleisBezetz).forEach(([locoID]) => {
      stopLoco(locoID);
      resetRoutes(locoID);
      setLocoAtPoint(locoID);
    });
  }

  function runSimulation() {
    const blockIDs = Object.keys($blocksDB);

    gleisBezetz.update((gleisBezetz) => {
      for (const [locoID, loco] of Object.entries($locosDB)) {
        gleisBezetz[locoID].departureBlockID = blockIDs.pop();
      }
      blockIDs.pop();
      for (const [locoID, loco] of Object.entries($locosDB)) {
        gleisBezetz[locoID].destinationBlockID = blockIDs.pop();
      }
      return gleisBezetz;
    });

    for (const [locoID, loco] of Object.entries($locosDB)) {
      setLocoPoint(locoID);
      generateRoutes(
        loco,
        $gleisBezetz[locoID].departureBlockID,
        $gleisBezetz[locoID].destinationBlockID
      );
    }
  }

  $: someStarted = Object.entries($gleisBezetz).some(
    ([locoID]) => $locosDB[locoID].velocity !== 0
  );

  onDestroy(() => {
    unsubscribe?.();
  });
</script>

<ControlMenuPanel title="Trains 'n Routes" dropdown startOpen mode="click">
  <div class="loco-destination-panel">
    <!-- <Button
    isActive={$tools.routeSimulation.enabled}
    on:click={() => {
      toggleTool('routeSimulation');
    }}
  >
    Route simulation
  </Button> -->

    <table class="loco-destination-table">
      <thead>
        <tr>
          <th>Loco</th>
          <th>Speed</th>
          <th>Depart from</th>
          <th>Destination</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries($locosDB) as [locoID, loco]}
          <tr>
            <td class="loco-cell" style={`color: ${loco.color}`}>
              {loco.title}
            </td>
            <td>{loco.velocity}</td>
            <td class="loco-assign">
              {#if !!$gleisBezetz[locoID]}
                <label>
                  <span>Departure</span>
                  <select
                    disabled={$locosDB[locoID].velocity !== 0}
                    bind:value={$gleisBezetz[locoID].departureBlockID}
                    on:change={() => {
                      setLocoPoint(locoID);
                      clearRouteDestination(locoID);
                    }}
                  >
                    <optgroup label="Schattenbahnhof 1">
                      {#each Object.entries($blocksDB) as [id, block]}
                        <option value={id}>{block.title}</option>
                      {/each}
                    </optgroup>
                    <option value={null}>Off track</option>
                  </select>
                </label>
              {/if}
            </td>
            <td>
              {#if !!$gleisBezetz[locoID]}
                <label>
                  <span>Destination</span>
                  <select
                    disabled={$locosDB[locoID].velocity !== 0 ||
                      !$gleisBezetz[locoID].departureBlockID}
                    bind:value={$gleisBezetz[locoID].destinationBlockID}
                    on:change={() => {
                      if (
                        $gleisBezetz[locoID].departureBlockID &&
                        $gleisBezetz[locoID].destinationBlockID
                      ) {
                        setLocoPoint(locoID);
                        generateRoutes(
                          loco,
                          $gleisBezetz[locoID].departureBlockID,
                          $gleisBezetz[locoID].destinationBlockID
                        );
                      }
                    }}
                  >
                    <optgroup label="Schattenbahnhof 1">
                      {#each Object.entries($blocksDB) as [id, block]}
                        <option value={id}>{block.title}</option>
                      {/each}
                    </optgroup>
                  </select>
                </label>
              {/if}
            </td>
            <!-- <td>
              <Button
                disabled={!$gleisBezetz[locoID]?.departureBlockID ||
                  !$gleisBezetz[locoID]?.destinationBlockID ||
                  !!(
                    $gleisBezetz[locoID]?.departureBlockID &&
                    $gleisBezetz[locoID]?.destinationBlockID &&
                    Object.keys($gleisBezetz[locoID]?.routes || {}).length
                  )}
                on:click={() => {
                  generateRoutes(
                    loco,
                    $gleisBezetz[locoID].departureBlockID,
                    $gleisBezetz[locoID].destinationBlockID
                  );
                }}
              >
                Generate routes
              </Button>
            </td> -->
            {#if !!$gleisBezetz[locoID]?.routes}
              <td>
                <div class="route-variations">
                  <select
                    bind:value={$gleisBezetz[locoID].activeRouteId}
                    on:change={() => {
                      const id = $gleisBezetz[locoID].activeRouteId;
                      setActiveRouteId(locoID, id);
                      previewRoute(locoID, id);
                      setLocoPoint(locoID);
                    }}
                    disabled={$locosDB[locoID].velocity !== 0 ||
                      !$gleisBezetz[locoID].departureBlockID ||
                      !$gleisBezetz[locoID].destinationBlockID}
                  >
                    {#each Object.entries($gleisBezetz[locoID].routes) as [id], index (id)}
                      <option
                        selected={id === $gleisBezetz[locoID].activeRouteId}
                        value={id}
                      >
                        {index}
                      </option>
                    {/each}
                  </select>
                </div>
              </td>
              <td class="start-stop-cell">
                <Button
                  disabled={!$gleisBezetz[locoID]?.activeRouteId}
                  on:click={() => {
                    resetPreview();
                    (loco.velocity !== 0 ? stopLoco : startLoco)(locoID);
                  }}>{loco.velocity !== 0 ? 'Stop' : 'Start'}</Button
                >
              </td>
              <td>
                <Button
                  on:click={() => resetRoutes(locoID)}
                  disabled={!$gleisBezetz[locoID]?.activeRouteId}
                >
                  Cancel
                </Button>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="TableFooter">
      <Button on:click={() => resetAll()}>Reset all</Button>
      <Button on:click={() => (someStarted ? stopAll() : startAll())}>
        {someStarted ? 'Stop all' : 'Start all'}
      </Button>
      <Button on:click={() => runSimulation()}>Run simulation</Button>
    </div>
  </div>
</ControlMenuPanel>

<style>
  .loco-destination-panel {
    padding: 10px;
  }
  .loco-destination-table {
    min-width: 400px;
    white-space: nowrap;
  }
  .loco-destination-table td,
  .loco-destination-table th {
    text-align: left;
  }
  .loco-cell {
    padding-right: 10px;
  }
  .route-variations {
    max-width: 100px;
    overflow-x: auto;
  }
  .TableFooter {
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
    padding-top: 5px;
    border-top: 1px solid #ccc;
  }
</style>
