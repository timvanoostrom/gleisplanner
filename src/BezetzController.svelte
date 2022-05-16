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
    getActiveRoute,
    getCoordString,
    gleisBezetz,
    GleisLink,
    gleisPlanned,
    GLEIS_LOCO_ROUTES_DEFAULT,
    LinkedRoute,
    pointConnections,
    Route,
    setActiveRouteId,
    setControlGleisIdsActive,
    setControlGleisIdsActive_,
  } from './store/gleis';
  import {
    blocksBySectionId,
    blocksDB,
    gleisByBlockId,
    resetRoutes,
    startLoco,
    stopLoco,
    setLocoAtPoint,
    getBezetzSegment,
    previewControlRoute,
  } from './store/sections';
  import { Loco, locosDB } from './store/workspace';
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
      console.log('dead endZZ at', currentGleis); //gpWrTYdIpKAP5zx9y_aZlwQ
      return [];
    }

    const blockCandidateFilterPredicate = destinationBlockID
      ? ([fromPoint, fromGleis, toPoint, toGleis]) => {
          const hasSectionId = !!toGleis?.sectionId;

          if (!hasSectionId) {
            return false;
          }

          const blockId = $blocksBySectionId?.[toGleis.sectionId]?.id;
          // console.log('has section id!', blockId);

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

    // console.log('connectionCandidates', connectionCandidates);
    // return;

    for (const candidateGleisLink of blockCandidates) {
      // TODO: Push all gleisID's in this section (via getAllGleisIdsInSection(candidate.blockId))
      routes.push([...routeGleisGleisLinks, candidateGleisLink]);
    }

    // console.log('blockCandidates', blockCandidates);

    // if (blockCandidates.length + connectionCandidates.length >= 1) {

    // }

    for (const [
      fromPoint,
      fromGleis,
      toPoint,
      toGleis,
    ] of connectionCandidates) {
      let nP = [...pointsCovered];
      if (!pointsCovered.includes(fromPoint + toPoint)) {
        nP.push(fromPoint + toPoint);
      } else {
        continue;
      }

      // setControlGleisIdsActive((ids) => [toGleis.id]);
      // await new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve();
      //   }, 200);
      // });
      findRoutesToAvailableSection(
        toGleis.id,
        toPoint,
        [...routeGleisGleisLinks],
        routes,
        depth + 1,
        destinationBlockID,
        nP
      );
      // break;
    }

    // console.log('r:', routes);

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
        (path as any).reverse();
        segment = path.toString();
      }

      length += sp.getTotalLength();
      path += segment;
    }

    return { path, length };
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

    console.log('blockPath:', blockPath, atPoint);

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
    console.log('\t p1', departureGleisID, routes1);

    const routes2 = findRoutes(
      departureGleisID,
      (pointString, index) => index === 1,
      destinationBlockID
    );

    console.log('\t p2', departureGleisID, routes2);

    const routes: LinkedRoute[] = [...routes1, ...routes2];

    const routesUnique = Array.from(
      new Set(routes.map((r) => r.map(([a, b, c, to]) => c).sort()))
    );

    console.log(
      'routesUnique',
      routesUnique,
      routesUnique.length,
      routes.length
    );

    if (!routes.length) {
      alert('Cannot generate route, no route to destination section found.');
    } else {
      const routesGenerated = {};
      for (const routeLinks of routes) {
        // routeLinks.shift();

        const pathCombined = combineLinksToPath(routeLinks);
        const route: Route = {
          id: generateID(),
          links: routeLinks,
          path: pathCombined?.path,
          length: pathCombined?.length,
        };

        routesGenerated[route.id] = {
          route,
          activeLinkIndex: 0,
          activePathSegments: [],
        };
      }

      // Remove starting link so route will activate next link first
      gleisBezetz.update((bezetzUpdated) => {
        const l = bezetzUpdated[loco.id] || jsonCopy(GLEIS_LOCO_ROUTES_DEFAULT);
        return {
          ...bezetzUpdated,
          [loco.id]: {
            ...l,
            routes: routesGenerated,
          },
        };
      });
    }
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
          <th>Depart from</th>
          <th>Destination</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries($locosDB) as [locoID, loco]}
          <tr>
            <td class="loco-cell">{loco.title}</td>
            <td class="loco-assign">
              {#if !!$gleisBezetz[locoID]}
                <label>
                  <span>Departure</span>
                  <select
                    disabled={$locosDB[locoID].velocity !== 0}
                    bind:value={$gleisBezetz[locoID].departureBlockID}
                    on:change={() => {
                      setLocoAtPoint(
                        locoID,
                        $gleisBezetz[locoID].departureBlockID === null
                          ? null
                          : getPointAtDepartureBlock(
                              $gleisBezetz[locoID].departureBlockID
                            )
                      );
                      resetRoutes(locoID);
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
                      $gleisBezetz[locoID].departureBlockID === null}
                    bind:value={$gleisBezetz[locoID].destinationBlockID}
                    on:change={() => resetRoutes(locoID)}
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
            <td>
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
            </td>
            {#if !!$gleisBezetz[locoID]?.routes}
              <td>
                <div class="route-variations">
                  <select
                    bind:value={$gleisBezetz[locoID].activeRouteId}
                    on:change={() => {
                      const id = $gleisBezetz[locoID].activeRouteId;
                      setActiveRouteId(locoID, id);
                      previewRoute(locoID, id);
                    }}
                    disabled={$locosDB[locoID].velocity !== 0}
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
                  on:click={() =>
                    loco.velocity !== 0 ? stopLoco(locoID) : startLoco(locoID)}
                  >{loco.velocity !== 0 ? 'Stop' : 'Start'}</Button
                >
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
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
</style>
