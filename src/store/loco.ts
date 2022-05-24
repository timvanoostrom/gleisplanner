import throttle from 'lodash.throttle';
import { derived, get, writable } from 'svelte/store';
import type { Loco, Locos, Point } from '../types';
import { db } from './appConfig';
import { gleisBezetz } from './bezetz';
import { getPointAtDepartureBlock } from './routes';

export const LOCO_STOCK_DEFAULT: Locos = {
  br218_0334: {
    id: 'br218_0334',
    title: 'BR218 -- 0334',
    direction: 'C1_C2',
    velocity: 0,
    color: 'red',
  },
  br103_01: {
    id: 'br103_01',
    title: 'BR103 -- 01',
    direction: 'C1_C2',
    velocity: 0,
    color: 'blue',
  },
};

export const locosDB = db<Locos>('locos', LOCO_STOCK_DEFAULT);
export const activeLocoID = writable<string>('');

export function setLocoPoint(locoID: string) {
  const routes = get(gleisBezetz);
  const point =
    routes[locoID].departureBlockID === null
      ? null
      : getPointAtDepartureBlock(routes[locoID].departureBlockID);
  console.log('Set-loco-at-point', locoID, point);
  return setLocoAtPoint(locoID, point);
}

export const saveLocoAtPoint = throttle(setLocoAtPoint, 400);

export function updateLoco(
  locoID: string,
  updatePayload: Partial<Loco> | ((loco: Loco) => Partial<Loco>)
) {
  locosDB.update((locosDB) => {
    const loco = locosDB[locoID];
    if (updatePayload) {
      locosDB[locoID] = {
        ...loco,
        ...(typeof updatePayload === 'function'
          ? updatePayload(loco)
          : updatePayload),
        id: locoID,
      };
    }
    return locosDB;
  });
}

export function stopLoco(locoID: Loco['id'], isWaiting: boolean = false) {
  updateLoco(locoID, { velocity: 0, isWaiting });
}

export function startLoco(locoID: string) {
  updateLoco(locoID, { velocity: 1, isWaiting: false });
}

export function setLocoAtPoint(locoID: string, point: Point | null = null) {
  const loco = get(locosDB)[locoID];
  if (point && loco.atPoint?.x !== point.x && loco.atPoint?.y !== point.y) {
    console.log('update p!');
    updateLoco(locoID, { atPoint: point });
  }
}

export const locoStackByGleisId = derived(
  [gleisBezetz, locosDB],
  ([gleisBezetz, locos]) => {
    const locoStackByGleisId = {};
    // TODO: Sorted by departure time and speed + possible delays
    const selectedRoutes = Object.entries(gleisBezetz);

    for (const [locoID, locoRoutes] of selectedRoutes) {
      const activeBezetzRoute = locoRoutes?.routes[locoRoutes?.activeRouteId];

      if (!!activeBezetzRoute) {
        for (const link of activeBezetzRoute.route.links) {
          if (link[3]) {
            const [, , , { id }] = link;
            if (!locoStackByGleisId[id]) {
              locoStackByGleisId[id] = [];
            }
            locoStackByGleisId[id].push(locoID);
          }
        }
      }
    }
    return locoStackByGleisId;
  }
);
