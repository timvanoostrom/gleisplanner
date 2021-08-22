import { Direction } from '../types';

export const PROJECT_PREFIX = 'gp';
export const TRACK_DISTANCE = 61.6; // 61.6 - ??compensation??

export const A90 = Math.PI / 2;
export const A180 = Math.PI;
export const A270 = A90 + A180;
export const A360 = Math.PI * 2;

export const DEFAULT_DIRECTION = -1;
export const GLEIS_WIDTH = 16.4;
export const GLEIS_WIDTH_WB = 29;

export const MAX_SCALE = 5;
export const MIN_SCALE = 0.1;

export const ROOT_POINT_ORIGIN_DIRECTION = Direction.R;
export const ROOT_POINT_ORIGIN_CONNECT_ANGLE = -A90;

export const GLEISPLAN_NAME_DEFAULT = '1629620107621-gleisplan-default.json';
