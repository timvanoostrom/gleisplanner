import type { ProtoGleis, ProtoGleisSegment } from '../../types';
import { Direction, TrackLib } from '../../types';

export const trackLibrary: TrackLib = {
  id: 'piko-a',
  title: 'Piko A gleis',
  gleis: [
    {
      id: 'piko-a-55209',
      artnr: '55209',
      type: 'Flex',
      title: 'Flex',
      price: 5.28,
      segments: [{ length: 940, type: 'Flex' }],
    },
    {
      id: 'piko-a-55200',
      artnr: '55200',
      type: 'Straight',
      title: 'G239',
      segments: [{ length: 239.07, type: 'Straight' }],
    },
    {
      id: 'piko-a-55201',
      artnr: '55201',
      type: 'Straight',
      title: 'G231',
      price: 1.72,
      segments: [{ length: 230.93, type: 'Straight' }],
    },
    {
      id: 'piko-a-55202',
      artnr: '55202',
      type: 'Straight',
      title: 'G119',
      segments: [{ length: 119.54, type: 'Straight' }],
    },
    {
      id: 'piko-a-55203',
      artnr: '55203',
      type: 'Straight',
      title: 'G115',
      segments: [{ length: 115.46, type: 'Straight' }],
    },
    {
      id: 'piko-a-55204',
      artnr: '55204',
      type: 'Straight',
      title: 'G107',
      segments: [{ length: 107.32, type: 'Straight' }],
    },
    {
      id: 'piko-a-55205',
      artnr: '55205',
      type: 'Straight',
      title: 'G62',
      segments: [{ length: 61.88, type: 'Straight' }],
    },
    {
      id: 'piko-a-55211',
      artnr: '55211',
      type: 'Curve',
      title: 'R1',
      price: 2.02,
      segments: [
        { type: 'Curve', angle: 30, radius: 360, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55251',
      artnr: '55251',
      type: 'Curve',
      title: 'R1¼ ',
      segments: [
        { type: 'Curve', angle: 7.5, radius: 360, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55212',
      artnr: '55212',
      type: 'Curve',
      title: 'R2',
      price: 2.02,
      segments: [
        { type: 'Curve', angle: 30, radius: 421.88, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55252',
      artnr: '55252',
      type: 'Curve',
      title: 'R2¼',
      segments: [
        { type: 'Curve', angle: 7.5, radius: 421.88, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55213',
      artnr: '55213',
      type: 'Curve',
      title: 'R3',
      price: 2.2,
      segments: [
        { type: 'Curve', angle: 30, radius: 483.75, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55214',
      artnr: '55214',
      type: 'Curve',
      title: 'R4',
      price: 2.2,
      segments: [
        { type: 'Curve', angle: 30, radius: 545.63, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55219',
      artnr: '55219',
      type: 'Curve',
      title: 'R9',
      price: 2.42,
      segments: [
        { type: 'Curve', angle: 15, radius: 907.97, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55220',
      artnr: '55220',
      title: 'WL15',
      type: 'Turnout',
      price: 17.07,
      segments: [
        { type: 'Straight', length: 239.07 },
        {
          type: 'Curve',
          angle: 15,
          radius: 907.97,
          direction: Direction.L,
        },
      ],
    },
    {
      id: 'piko-a-55221',
      artnr: '55221',
      title: 'WR15',
      type: 'Turnout',
      price: 17.07,
      segments: [
        { type: 'Straight', length: 239.07 },
        { type: 'Curve', angle: 15, radius: 907.97, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55226',
      artnr: '55226',
      title: 'WY',
      type: 'Turnout',
      price: 34.85,
      segments: [
        { type: 'Curve', angle: 15, radius: 907.97, direction: Direction.L },
        { type: 'Curve', angle: 15, radius: 907.97, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55222',
      artnr: '55222',
      type: 'TurnoutCurved',
      title: 'BWl2/3',
      segments: [
        {
          type: 'Curve',
          length1: 61.88,
          angle: 30,
          radius: 422.88,
          direction: Direction.L,
        },
        { type: 'Curve', angle: 30, radius: 422.88, direction: Direction.L },
      ],
    },
    {
      id: 'piko-a-55223',
      artnr: '55223',
      type: 'TurnoutCurved',
      title: 'BWr2/3',
      segments: [
        {
          type: 'Curve',
          length1: 61.88,
          angle: 30,
          radius: 422.88,
          direction: Direction.R,
        },
        { type: 'Curve', angle: 30, radius: 422.88, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55227',
      artnr: '55227',
      type: 'TurnoutCurved',
      title: 'BWl3/4',
      segments: [
        {
          type: 'Curve',
          length1: 61.88,
          angle: 30,
          radius: 483.75,
          direction: Direction.L,
        },
        { type: 'Curve', angle: 30, radius: 483.75, direction: Direction.L },
      ],
    },
    {
      id: 'piko-a-55228',
      artnr: '55228',
      type: 'TurnoutCurved',
      title: 'BWr3/4',
      segments: [
        {
          type: 'Curve',
          length1: 61.88,
          angle: 30,
          radius: 483.75,
          direction: Direction.R,
        },
        { type: 'Curve', angle: 30, radius: 483.75, direction: Direction.R },
      ],
    },
    {
      id: 'piko-a-55225',
      artnr: '55225',
      type: 'ThreeWay',
      title: 'DWW15',
      segments: [
        { type: 'Straight', length: 239.07 },
        { type: 'Curve', angle: 15, radius: 907.97, direction: Direction.R },
        { type: 'Curve', angle: 15, radius: 907.97, direction: Direction.L },
      ],
    },
    {
      id: 'piko-a-55240',
      artnr: '55240',
      type: 'Crossing',
      title: 'K15',
      price: 20.46,
      segments: [
        {
          type: 'Straight',
          length: 239.07,
        },
        {
          type: 'Straight',
          angle: 15,
          length: 239.07,
        },
      ],
    },
    {
      id: 'piko-a-55241',
      artnr: '55241',
      type: 'Crossing',
      title: 'K30',
      price: 18.7,
      segments: [
        {
          type: 'Straight',
          length: 119.54,
        },
        {
          type: 'Straight',
          angle: 30,
          length: 119.54,
        },
      ],
    },
    {
      id: 'piko-a-55224',
      artnr: '55224',
      type: 'Engels',
      title: 'DKW15',
      price: 34.85,
      segments: [
        {
          type: 'Straight',
          length: 239.07,
        },
        {
          type: 'Straight',
          angle: 15,
          length: 239.07,
        },
      ],
    },
  ],
};
