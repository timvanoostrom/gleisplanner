<script lang="ts">
  import { onDestroy } from 'svelte';
  import Button from './Button.svelte';
  import { isWithinRadius } from './helpers/geometry';
  import {
    Combo,
    getCoordString,
    gleisBezetz,
    gleisIdsActive,
    gleisPlanned,
    pointConnections,
  } from './store/gleis';
  import type { GleisPropsPlanned, Point } from './types';

  function findPointByCoordString(points: Point[], str: string) {
    return points.find((p) => getCoordString(p) === str);
  }

  function getConnectedGleis(
    gleisById: Record<GleisPropsPlanned['id'], GleisPropsPlanned>,
    connectionsByCoordString: unknown,
    currentGleis: GleisPropsPlanned,
    curPoint: string
  ): Combo[] {
    const connectingPoints =
      currentGleis.pathSegments
        ?.filter((segment) => segment.type === 'main')
        .flatMap((segment) =>
          segment.points
            .filter((pointString) => {
              return pointString !== curPoint;
            })
            .filter((pointString) =>
              ['c1', 'c2'].includes(
                findPointByCoordString(currentGleis.points, pointString)?.type
              )
            )
            .map((pointStr) => [pointStr, 'connectedAt.' + segment.gleisType])
        ) || [];

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

    const pointWendelConnect = currentGleis?.config?.['wendel-connect'];
    if (pointWendelConnect) {
      // Find connections at outgoing point.
      // If the connection is in the same layer it must be a continuation of the wendel right?
      // If the connection is in another layer, which layer should we take?
      candidates = connectedGleis.filter(([pointStr, gleisProps]: Combo) => {
        return (
          pointStr === getCoordString(pointWendelConnect) &&
          gleisProps.layerId !== currentGleis.layerId
        );
      });
    }

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
    curPoint: string,
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
        if (candidates.length > 1) {
          const curPointType = findPointByCoordString(
            currentGleis.points,
            curPoint
          )?.type;
          console.log(
            '....',
            curPointType || 'Cannot determine current point type'
          );
          if (curPointType) {
            combo = candidates.find(([coordString, { points }], index) => {
              const candidatePoint = findPointByCoordString(
                points,
                coordString
              );
              console.log(
                'candidate ' + index + ' point type',
                candidatePoint?.type
              );
              return !!candidatePoint && curPointType === candidatePoint?.type;
            });
            console.log('combo!', combo);
          }
        }
        break;
      case 'Turnout':
        [, combo] = candidates;
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

  function getComboAt(
    gleisId: GleisPropsPlanned['id'],
    curPoint: string,
    gleisById: Record<GleisPropsPlanned['id'], GleisPropsPlanned>,
    connectionsByCoordString: unknown
  ) {
    const currentGleis: GleisPropsPlanned = gleisById[gleisId];
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
    return getNextGleisCombo(curPoint, currentGleis, candidates);
  }

  function* runSimulation(
    gleisById: Record<GleisPropsPlanned['id'], GleisPropsPlanned>,
    connectionsByCoordString: unknown,
    startAtId: GleisPropsPlanned['id']
  ) {
    let curPoint = '';
    let activeBezetzId: GleisPropsPlanned['id'] = startAtId;

    while (true) {
      const activeCombo = getComboAt(
        activeBezetzId,
        curPoint,
        gleisById,
        connectionsByCoordString
      );
      if (activeCombo) {
        const [nextPoint, { id: nextBezetzId }] = activeCombo;

        const nextCombo = getComboAt(
          nextBezetzId,
          nextPoint,
          gleisById,
          connectionsByCoordString
        );

        activeBezetzId = nextBezetzId;
        curPoint = nextPoint;

        yield {
          [activeBezetzId]: [...activeCombo, ...(nextCombo ?? [])],
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
