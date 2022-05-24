import { jsonCopy } from '../helpers/app';
import type { BezetzRoutes, LocoRoutes } from '../types';
import { db } from './appConfig';

export const GLEIS_LOCO_ROUTES_DEFAULT: LocoRoutes = {
  routes: {},
  activeRouteId: '',
  departureBlockID: '',
  destinationBlockID: '',
};

// TODO: Make this filling dynamic
export const GLEIS_BEZETZ_DEFAULT: BezetzRoutes = {
  br218_0334: jsonCopy(GLEIS_LOCO_ROUTES_DEFAULT),
  br103_01: jsonCopy(GLEIS_LOCO_ROUTES_DEFAULT),
};

export const gleisBezetz = db<BezetzRoutes>(
  'gleisBezetz',
  jsonCopy(GLEIS_BEZETZ_DEFAULT)
);
