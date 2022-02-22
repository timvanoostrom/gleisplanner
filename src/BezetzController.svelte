<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { derived, get } from 'svelte/store';
  import Button from './Button.svelte';
  import { isWithinRadius } from './helpers/geometry';
  import {
    Combo,
    findConnection,
    getCoordString,
    gleisBezetz,
    gleisIdsActive,
    gleisPlanned,
    gleisPlannedUnselectedByLayerId,
    pointConnections,
  } from './store/gleis';
  import { layerControl } from './store/layerControl';
  import { tools } from './store/workspace';
  import type { GleisPropsPlanned, Point } from './types';

  // const activeLayerGleisById = derived(
  //   [gleisPlannedUnselectedByLayerId, layerControl],
  //   ([gleisPlannedUnselectedByLayerId, layerControl]) => {
  //     const gleis = layerControl.layers
  //       .filter((layer) => layer.isVisible)
  //       .flatMap((layer) => {
  //         return gleisPlannedUnselectedByLayerId[layer.id] || [];
  //       });
  //     return gleis.reduce((acc, gleisProps) => {
  //       return Object.assign(acc, { [gleisProps.id]: gleisProps });
  //     }, {});
  //   }
  // );

  // export function findAllConnectingGleisAtPoints(
  //   gleisz: Record<GleisPropsPlanned['id'], GleisPropsPlanned>,
  //   points: Point[],
  //   excludeId: GleisPropsPlanned['id']
  // ): Array<[Point, GleisPropsPlanned]> {
  //   return points
  //     .filter((p) => ['c1', 'c2'].includes(p.type))
  //     .map((point) => {
  //       const connectingGleis = findConnection(gleisz, point, excludeId);
  //       return [point, connectingGleis];
  //     })
  //     .filter(([id, gleis]) => {
  //       return !!gleis;
  //     }) as Array<[Point, GleisPropsPlanned]>;
  // }

  // Select connecting gleis not attached to the currentPoint.
  // Will result in all (c1|c2) points of first gleis if there is no current point.
  function findPointType(points: Point[], str: string) {
    return points.find((p) => getCoordString(p) === str);
  }

  function getConnectedGleis(
    gleisById: Record<GleisPropsPlanned['id'], GleisPropsPlanned>,
    connectionsByCoordString: unknown,
    currentGleis: GleisPropsPlanned,
    curPoint: string
  ): Combo[] {
    const connectingPoints = currentGleis.pathSegments
      .filter((segment) => segment.type === 'main')
      .flatMap((segment) =>
        segment.points
          .filter((pointString) => {
            return pointString !== curPoint;
          })
          .filter((pointString) =>
            ['c1', 'c2'].includes(
              findPointType(currentGleis.points, pointString)?.type
            )
          )
          .map((pointStr) => [pointStr, 'connectedAt.' + segment.gleisType])
      );

    // All the connected gleis on the far-side points of the currentActivePoint. In the case of the first gleis, it will
    // be the gleis connected at all the points
    const connectedGleis = connectingPoints.flatMap(
      ([pointString, connectedAtSegment]) => {
        return (
          connectionsByCoordString[pointString]
            ?.filter((id) => id !== currentGleis.id)
            .map((id) => {
              return [
                pointString,
                gleisById[id],
                gleisById[id].type + '.' + connectedAtSegment,
              ];
            }) || []
        );
      }
    );

    return connectedGleis;
  }

  function getNextGleisCandidates(
    curPoint: string,
    currentGleis: GleisPropsPlanned,
    connectedGleis: Combo[]
  ) {
    let candidates = connectedGleis.filter(
      ([pointStr, gleisProps]: Combo) =>
        gleisProps.layerId === currentGleis.layerId
    );

    if (!candidates.length && connectedGleis.length) {
      console.log('Check possible candidates in another layer');
      // Which layer to take here?
      candidates = connectedGleis;
    }

    const [x1, y1] = curPoint.split(',').map((s) => parseInt(s, 10));
    const po = { x: x1, y: y1 };

    // Select the connecting gleis farthest away from the origin point
    candidates = candidates.filter(([coordString, gleisProps, connection]) => {
      const [x2, y2] = coordString.split(',').map((s) => parseInt(s, 10));
      return !isWithinRadius(po, { x: x2, y: y2 }, 100);
    });

    console.log('candidates:', currentGleis.type, candidates);

    return candidates;
  }

  function getNextGleisCombo(
    currentGleis: GleisPropsPlanned,
    candidates: Combo[]
  ): Combo {
    /** TODO: Where to go from here.
     * - Check if turnouts/engels are straight/branched
     * - Check which crossing segment we should take
     * - Check which connecting gleis are available / reserved / closed etc.
     * - Check if there is a signal?
     *
     * for now: Check
     */
    let gleisConnectedAt;
    let combo;

    switch (currentGleis.type) {
      case 'Curve':
      case 'Flex':
      case 'Straight':
        break;
      case 'Turnout':
        break;
      case 'TurnoutCurved':
        break;
      case 'ThreeWay':
        break;
      case 'Engels':
        [combo] = candidates;
        break;
      case 'Crossing':
        break;
    }

    if (!combo) {
      [combo] = candidates;
    }

    return combo;
  }

  function* runSimulation(
    gleisById: Record<GleisPropsPlanned['id'], GleisPropsPlanned>,
    connectionsByCoordString: unknown,
    startAtId: GleisPropsPlanned['id']
  ) {
    let curPoint = '';
    let activeBezetzId: GleisPropsPlanned['id'] = startAtId;

    while (true) {
      const currentGleis: GleisPropsPlanned = gleisById[activeBezetzId];
      const connectedGleis = getConnectedGleis(
        gleisById,
        connectionsByCoordString,
        currentGleis,
        curPoint
      );
      const candidates = getNextGleisCandidates(
        curPoint,
        currentGleis,
        connectedGleis
      );
      const combo = getNextGleisCombo(currentGleis, candidates);

      if (combo) {
        [curPoint, { id: activeBezetzId }] = combo;
        yield {
          [activeBezetzId]: combo,
        };
      } else {
        return;
      }
    }
  }

  let simulation = null;
  let unsubscribe;

  function nextStep() {
    if (!simulation) {
      const startAtId = $gleisIdsActive[0];
      if (startAtId) {
        simulation = runSimulation($gleisPlanned, $pointConnections, startAtId);
      } else {
        alert('Select start gleis');
        return;
      }
    }
    // Call next
    const nextBezetz = simulation.next();
    if (nextBezetz.value) {
      gleisBezetz.set(nextBezetz.value);
    } else {
      stopSimulation();
    }
  }

  export function stopSimulation() {
    if (simulation) {
      // alert('Simulation stopped.');
      simulation?.return();
      gleisBezetz.set({});
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
<Button on:click={() => nextStep()}>next &raquo;</Button>
