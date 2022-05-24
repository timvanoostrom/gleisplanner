import type { Path as d3Path } from 'd3-path';
import type { ZoomState } from './store/workspace';

export interface AppConfig {
  dimensions: Dimensions;
  gridSize: Dimensions;
  gridVisible: boolean;
  currentZoom: ZoomState;
  protoGleisIdActive: string;
  gleisPlanSaveIdSelected?: string;
  viewBoxTranslation: Point | null;
  gleisIdsActive: string[];
  controlGleisIdsActive: string[];
  trackLibQuickSelect: Record<string, string>;
  sidebarState: SidebarState;
  activeTrackLibId: string;
}

export type GleisType =
  | 'Curve'
  | 'Flex'
  | 'Straight'
  | 'Turnout'
  | 'TurnoutCurved'
  | 'ThreeWay'
  | 'Engels'
  | 'Crossing';

export enum Direction {
  R = 1,
  L = -1,
}

export enum Drive {
  A = 1,
  B = 2,
  AB = 3,
}

export type Ctype = 'Start' | 'End';

export type Segment<Path, Proto> = {
  path: Path;
  proto: Proto;
};

export interface Point {
  x: number;
  y: number;
  type?:
    | 'c1'
    | 'c2'
    | 'cc'
    | 'lbl'
    | 'fcp1'
    | 'fcp2'
    | 'po-c1'
    | 'po-c2'
    | 'add'
    | 'po-s1';
  connectAngle?: number;
  direction?: Direction;
  root?: true;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type PointDimensions = Point & Dimensions;

export interface PathPoint<T extends Ctype> extends Omit<Point, 'type'> {
  type: T;
  id?: string;
}

export type PathPointStart = PathPoint<'Start'>;
export type PathPointEnd = PathPoint<'End'>;

export type PathPoints = Array<PathPointStart | PathPointEnd>;
export type PathConnectPoint = (PathPointStart | PathPointEnd) & {
  connectAngle?: number;
  variantAngle?: number;
  protoAngle?: number;
};
export type PathConnectPoints = PathConnectPoint[];
export type FlexPoints = Point[];

export interface SlopeConfigBase {
  id: string;
  title: string;
  gleisIds: Array<GleisPropsPlanned['id']>;
  percentage: number;
  startElevation: number;
}
export interface SlopeConfig extends SlopeConfigBase {
  totalLength: number;
  elevation: number;
}

export type Slopes = Record<string, SlopeConfig>;

export type SectionDirection = 'C1_C2' | 'C2_C1' | 'CX_CX';

export interface Section {
  id: string;
  title: string;
  isActivated: boolean;
  symbolAtPoint?: Point;
  blockId?: string;
}

export type Sections = Record<Section['id'], Section>;

export interface Block {
  id: string;
  title: string;
}

export type Blocks = Record<Block['id'], Block>;

export interface GleisConfig {
  bridge?: 1;
  tunnel?: 1;
  'wendel-connect'?: Point;
}

export interface GleisPropsPlanned {
  id: string;
  artnr: string;
  type: GleisType;
  layerId: Layer['id'];
  blockId: Section['id'];
  sectionId: Section['id'];
  points: Point[];
  variant?: string;
  slope?: SlopeConfig;
  pathSegments: PathSegmentProps[];
  config?: GleisConfig;
}

export interface ProtoSegmentCurve {
  type: 'Curve';
  direction: Direction;
  radius: number;
  angle: number;
  length?: number;
  length1?: number;
  length2?: number;
  rotationPointOffsetRadius?: number;
}

export interface ProtoSegmentStraight {
  type: 'Straight';
  length: number;
  angle?: number;
}

export interface ProtoSegmentFlex {
  type: 'Flex';
  length: number;
  points?: Point[];
}

export type ProtoGleisSegment =
  | ProtoSegmentCurve
  | ProtoSegmentStraight
  | ProtoSegmentFlex;

export type ProtoTurnoutSegments = Array<
  ProtoSegmentCurve | ProtoSegmentStraight
>;

export interface ProtoGleis<T extends ProtoGleisSegment = ProtoGleisSegment> {
  artnr: string;
  id: string;
  title: string;
  type: GleisType;
  category?: string;
  price?: number;
  segments: T[];
  libId?: TrackLib['id'];
}

export type AnglePreset = Array<number | ((c: Point) => Point) | undefined>;

export interface PathSegmentProps {
  d: d3Path | string;
  type: 'main' | 'outer' | 'p1' | 'p2' | 'add' | 'splits' | 'branch';
  gleisType?: GleisType | 'Curve2' | 'Straight2';
  points?: string[];
}

export type GleisPlanned = Record<GleisPropsPlanned['id'], GleisPropsPlanned>;
export interface SavedConfig {
  id: string;
  name: string;
  gleisPlanned: GleisPlanned;
  layerControl: LayerControl;
  appConfig: AppConfig;
  guides: Guides;
  sections: Sections;
  blocks: Blocks;
  dateUpdated: string;
  activeTrackLibId: string;
}
export type GleisPlanSaved = Record<string, SavedConfig>;

export interface LayerControl {
  layers: Layer[];
  activeLayerId: Layer['id'];
}

export interface Layer {
  id: string;
  name: string;
  isVisible: boolean;
  locked: boolean;
  color: string;
  patternId?: string;
}

export type SidebarState = 'visible' | 'hidden';

export interface Guide {
  id: string;
  points: Point[];
  label: string;
  layerId: Layer['id'];
  type: 'line' | 'rect';
  width?: number;
  height?: number;
  transform?: string;
  style?: Record<string, string>;
}
export type Guides = Guide[];

export interface TrackLib {
  id: string;
  title: string;
  gleis: ProtoGleis<ProtoGleisSegment>[];
}

export interface Tab {
  title: string;
}

type PointString = string;

export type GleisLink = [
  /* FROM: */
  PointString,
  GleisPropsPlanned | null,
  /* TO: */
  PointString,
  GleisPropsPlanned | null
];

export type LinkedRoute = GleisLink[];

export interface Route {
  id: string;
  links: GleisLink[];
  path: string;
  length: number;
}

export interface BezetzRoute {
  route: Route;
  activeLinkIndex: number;
  activePathSegments: string[];
  endAtPoint: Point | null;
}

export interface LocoRoutes {
  routes: {
    [routeId: string]: BezetzRoute;
  };
  activeRouteId: string;
  departureBlockID: Block['id'];
  destinationBlockID: Block['id'];
}

export interface BezetzRoutes {
  [locoID: string]: LocoRoutes;
}

export interface Loco {
  id: string;
  title: string;
  atPoint?: Point;
  direction: SectionDirection;
  velocity: number;
  color: string;
  length?: number;
  isWaiting?: boolean;
}

export interface Locos {
  [id: string]: Loco;
}

export type ActiveLinkRegistry = Record<
  Loco['id'],
  { nextID: GleisPropsPlanned['id']; currentID: GleisPropsPlanned['id'] }
>;
