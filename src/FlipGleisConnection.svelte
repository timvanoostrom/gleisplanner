<script lang="ts">
  import type { Readable } from 'svelte/store';
  import { A180, ROOT_POINT_ORIGIN_DIRECTION } from './config/constants';
  import { trackLibByArtNr } from './config/trackLib';
  import { calculateCurvePoints } from './helpers/curve';
  import { calculateEngelsPoints } from './helpers/engels';
  import { normalizeAngle } from './helpers/geometry';
  import type { CalculateTurnoutPointsProps } from './helpers/turnout';
  import { calculateTurnoutPoints } from './helpers/turnout';
  import type { CalculateTurnoutCurvedPointsProps } from './helpers/turnoutCurved';
  import { calculateTurnoutCurvedPoints } from './helpers/turnoutCurved';
  import {
    findConnectingPointOrigin,
    getRootPointOrigin,
    gleisIdsActive,
    updateGleis,
  } from './store/gleis';
  import type {
    GleisPropsPlanned,
    Point,
    ProtoSegmentCurve,
    ProtoSegmentStraight,
  } from './types';

  export let gleisSelected: Readable<GleisPropsPlanned[]>;

  let connectionSwitchIndex: number = 0;
  let pointOrigin = null;
  let switchPoints = null;

  gleisIdsActive.subscribe(() => {
    resetConnectionSwitch();
  });

  function resetConnectionSwitch() {
    connectionSwitchIndex = 0;
    pointOrigin = null;
  }

  function cyclePointTypes(gleisPropsPayload: GleisPropsPlanned[]) {
    const updates = [];

    for (const gleisProps of gleisPropsPayload) {
      const points = [];
      for (const point of gleisProps.points) {
        if (point.type === 'c1' || point.type === 'c2') {
          points.push({
            ...point,
            type: point.type === 'c1' ? 'c2' : 'c1',
          });
        } else {
          points.push(point);
        }
      }
      updates.push({
        id: gleisProps.id,
        points,
      });
      _l('updates', updates);
    }
    updateGleis(updates);
  }

  function onKeydownRouter(event: KeyboardEvent) {
    switch (event.key) {
      case 'f':
      case 'F':
        if ($gleisSelected.length >= 1) {
          event.preventDefault();

          if (event.shiftKey) {
            cyclePointTypes($gleisSelected);
            return;
          }

          if ($gleisSelected.length === 1) {
            const [gleisProps] = $gleisSelected;
            const proto = $trackLibByArtNr[gleisProps.artnr];
            const [protoSegment] = proto.segments;

            let pointOrigin: Point;
            let pointOrigin2: Point;
            let connectingPointOrigin: Point;
            let connectingPointOrigin2: Point;

            if (gleisProps.type === 'Curve' && protoSegment.type === 'Curve') {
              [pointOrigin, pointOrigin2] = gleisProps.points;

              if (!pointOrigin.root) {
                [connectingPointOrigin] = findConnectingPointOrigin(
                  pointOrigin,
                  gleisProps.id
                );
                if (connectingPointOrigin) {
                  // Omit the root here
                  const { root, ...pointOriginProps } = pointOrigin;
                  pointOrigin = {
                    ...pointOriginProps,
                  };
                  pointOrigin.connectAngle = normalizeAngle(
                    pointOrigin.connectAngle + A180 * -1
                  );
                } else if (connectingPointOrigin2) {
                  alert('Dunno what to do, check the case!');
                } else {
                  alert(
                    "Completely detached points can't be flipped, try rotate/move"
                  );
                  return;
                }
              } else {
                // TODO: Might nog be a reliable determination of flippedness
                const isCurrentlyFlipped =
                  pointOrigin2.direction !== ROOT_POINT_ORIGIN_DIRECTION;

                if (isCurrentlyFlipped) {
                  pointOrigin = getRootPointOrigin(
                    pointOrigin.x,
                    pointOrigin.y
                  );
                } else {
                  pointOrigin.connectAngle = normalizeAngle(
                    pointOrigin.connectAngle + A180 * -1
                  );
                }
              }

              const points = calculateCurvePoints({
                pointOrigin,
                proto: protoSegment,
                connectingPointOrigin,
              });

              updateGleis([
                {
                  id: gleisProps.id,
                  points,
                },
              ]);
            } else if (gleisProps.type === 'Turnout') {
              const cycleTurnoutVariant = (
                variant: CalculateTurnoutPointsProps['variant']
              ) => {
                switch (variant) {
                  case 's1':
                  case undefined:
                    return 's2';
                  case 's2':
                    return 'c1';
                  default:
                    return 's1';
                }
              };
              const connectingPointOrigin = gleisProps.points.find((p) =>
                p.type.startsWith('po-')
              );

              if (connectingPointOrigin) {
                const variant = cycleTurnoutVariant(gleisProps.variant);
                const points = calculateTurnoutPoints({
                  pointOrigin: connectingPointOrigin,
                  protos: proto.segments as Array<
                    ProtoSegmentStraight | ProtoSegmentCurve
                  >,
                  connectingPointOrigin,
                  variant,
                });

                updateGleis([
                  {
                    id: gleisProps.id,
                    points,
                    variant,
                  },
                ]);
              }
            } else if (gleisProps.type === 'TurnoutCurved') {
              const cycleTurnoutVariant = (
                variant: CalculateTurnoutCurvedPointsProps['variant']
              ) => {
                switch (variant) {
                  case 'c1':
                  case undefined:
                    return 'c2';
                  case 'c2':
                    return 'c3';
                  default:
                    return 'c1';
                }
              };
              const connectingPointOrigin = gleisProps.points.find((p) =>
                p.type.startsWith('po-')
              );

              if (connectingPointOrigin) {
                const variant = cycleTurnoutVariant(gleisProps.variant);
                const points = calculateTurnoutCurvedPoints({
                  pointOrigin: connectingPointOrigin,
                  protos: proto.segments as ProtoSegmentCurve[],
                  connectingPointOrigin,
                  variant,
                });

                updateGleis([
                  {
                    id: gleisProps.id,
                    points,
                    variant,
                  },
                ]);
              }
            } else if (
              gleisProps.type === 'Crossing' ||
              gleisProps.type === 'Engels'
            ) {
              const isDoubleSlip = proto.title.startsWith('DKW');
              const isKW = proto.title.includes('KW');
              const cycleSingleSlipVariant = (
                variant: CalculateTurnoutCurvedPointsProps['variant']
              ) => {
                switch (variant) {
                  case 's1':
                  case undefined:
                    return 's2';
                  case 's2':
                    return 's3';
                  case 's3':
                    return 's4';
                  default:
                    return 's1';
                }
              };
              const [proto1, proto2] = proto.segments as ProtoSegmentStraight[];
              let variant =
                !gleisProps.variant || gleisProps.variant === 's1'
                  ? 's2'
                  : 's1';
              if (isKW && !isDoubleSlip) {
                variant = cycleSingleSlipVariant(gleisProps.variant);
              }
              _l('variant', variant);
              [pointOrigin, pointOrigin2] = gleisProps.points;
              const connectingPointOrigin = gleisProps.points.find(
                (p) => p.type === 'po-s1'
              );
              const points = calculateEngelsPoints({
                pointOrigin: connectingPointOrigin,
                protos: [proto1, proto2],
                variant,
                connectingPointOrigin,
                doubleSlip: isDoubleSlip,
              });
              updateGleis([
                {
                  id: gleisProps.id,
                  points,
                  variant,
                },
              ]);
            } else if (
              gleisProps.type !== 'Flex' &&
              gleisProps.type !== 'Straight'
            ) {
            }
          }
        }
        break;
      case 'Escape':
      case 'Enter':
        resetConnectionSwitch();
        break;
    }
  }
</script>

<svelte:window on:keydown={onKeydownRouter} />
