import type { ProtoGleis, ProtoGleisSegment, TrackLib } from '../../types';
import { Direction } from '../../types';

export const trackLibrary: TrackLib = {
  id: 'roco-line',
  title: 'Roco line',
  gleis: [
    {
      artnr: '42400',
      id: 'roco-42400',
      title: 'F4w',
      type: 'Flex',
      segments: [
        {
          type: 'Flex',
          length: 920,
        },
      ],
    },
    {
      artnr: '42401',
      id: 'roco-42401',
      title: 'F4c',
      type: 'Flex',
      segments: [
        {
          type: 'Flex',
          length: 920,
        },
      ],
    },
    {
      artnr: '42406',
      id: 'roco-42406',
      title: 'G4',
      type: 'Straight',
      segments: [
        {
          type: 'Straight',
          length: 920,
        },
      ],
    },
    {
      id: 'roco-D2',
      title: 'D2',
      artnr: 'D2',
      type: 'Straight',
      category: 'Connect',
      segments: [{ type: 'Straight', length: 2 }],
    },
    {
      id: 'roco-D4',
      title: 'D4',
      artnr: 'D4',
      type: 'Straight',
      category: 'Connect',
      segments: [{ type: 'Straight', length: 4 }],
    },
    {
      id: 'roco-D5',
      title: 'D5',
      artnr: 'D5',
      type: 'Straight',
      category: 'Connect',
      segments: [{ type: 'Straight', length: 5 }],
    },
    {
      id: 'roco-D8',
      title: 'D8',
      artnr: 'D8',
      type: 'Straight',
      category: 'Connect',
      segments: [{ type: 'Straight', length: 8 }],
    },
    {
      id: 'roco-D12',
      title: 'D12',
      artnr: 'D12',
      type: 'Straight',
      category: 'Connect',
      segments: [{ type: 'Straight', length: 12 }],
    },
    {
      artnr: '42408',
      id: 'roco-42408',
      title: 'R2¼',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 358,
          angle: 7.5,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42409',
      id: 'roco-42409',
      title: 'R3¼',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 419.6,
          angle: 7.5,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42410',
      id: 'roco-42410',
      title: 'G1',
      type: 'Straight',
      segments: [
        {
          type: 'Straight',
          length: 230,
        },
      ],
    },
    {
      artnr: '42411',
      id: 'roco-42411',
      title: 'DG1',
      type: 'Straight',
      segments: [
        {
          type: 'Straight',
          length: 119,
        },
      ],
    },
    {
      artnr: '42412',
      id: 'roco-42412',
      title: 'G½',
      type: 'Straight',
      segments: [
        {
          type: 'Straight',
          length: 115,
        },
      ],
    },
    {
      artnr: '42413',
      id: 'roco-42413',
      title: 'G¼',
      type: 'Straight',
      segments: [
        {
          type: 'Straight',
          length: 57.5,
        },
      ],
    },
    {
      artnr: '42422',
      id: 'roco-42422',
      title: 'R2',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 358,
          angle: 30,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42423',
      id: 'roco-42423',
      title: 'R3',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 419.6,
          angle: 30,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42424',
      id: 'roco-42424',
      title: 'R4',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 481.2,
          angle: 30,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42425',
      id: 'roco-42425',
      title: 'R5',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 542.8,
          angle: 30,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42426',
      id: 'roco-42426',
      title: 'R6',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 604.4,
          angle: 30,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42427',
      id: 'roco-42427',
      title: 'R9',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 826.4,
          angle: 15,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42428',
      id: 'roco-42428',
      title: 'R10',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 888,
          angle: 15,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42430',
      id: 'roco-42430',
      title: 'R20',
      type: 'Curve',
      segments: [
        {
          type: 'Curve',
          radius: 1962,
          angle: 5,
          direction: Direction.R,
        },
      ],
    },
    {
      artnr: '42440',
      id: 'roco-42440',
      title: 'Wl15',
      type: 'Turnout',
      segments: [
        {
          type: 'Straight',
          length: 230,
        },
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 873.5,
          angle: 15,
          length1: 4,
        },
      ],
    },
    {
      artnr: '42441',
      id: 'roco-42441',
      title: 'Wr15',
      type: 'Turnout',
      segments: [
        {
          type: 'Straight',
          length: 230,
        },
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 873.5,
          angle: 15,
          length1: 4,
        },
      ],
    },
    {
      artnr: '42448',
      id: 'roco-42448',
      title: 'EKW15',
      type: 'Engels',
      segments: [
        {
          type: 'Straight',
          length: 230,
        },
        {
          type: 'Straight',
          angle: 15,
          length: 230,
        },
      ],
    },
    {
      artnr: '42451',
      id: 'roco-42451',
      title: 'DKW15',
      type: 'Engels',
      segments: [
        {
          type: 'Straight',
          length: 230,
        },
        {
          type: 'Straight',
          angle: 15,
          length: 230,
        },
      ],
    },
    {
      artnr: '42454',
      id: 'roco-42454',
      title: 'DWW15',
      type: 'ThreeWay',
      segments: [
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 873.5,
          angle: 15,
          length1: 57.7,
        },
        {
          type: 'Straight',
          length: 287.5,
        },
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 873.5,
          angle: 15,
        },
      ],
    },
    {
      artnr: '42464',
      id: 'roco-42464',
      title: 'BWl2/3',
      type: 'TurnoutCurved',
      segments: [
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 358,
          angle: 30,
          length1: 61.6,
          rotationPointOffsetRadius: 33,
        },
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 358,
          angle: 30,
        },
      ],
    },
    {
      artnr: '42465',
      id: 'roco-42465',
      title: 'BWr2/3',
      type: 'TurnoutCurved',
      segments: [
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 358,
          angle: 30,
          length1: 61.6,
          rotationPointOffsetRadius: 33,
        },
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 358,
          angle: 30,
        },
      ],
    },
    {
      artnr: '42472',
      id: 'roco-42472',
      title: 'BWl3/4',
      type: 'TurnoutCurved',
      segments: [
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 419.6,
          angle: 30,
          length1: 61.6,
          rotationPointOffsetRadius: 33,
        },
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 419.6,
          angle: 30,
        },
      ],
    },
    {
      artnr: '42473',
      id: 'roco-42473',
      title: 'BWr3/4',
      type: 'TurnoutCurved',
      segments: [
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 419.6,
          angle: 30,
          length1: 61.6,
          rotationPointOffsetRadius: 33,
        },
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 419.6,
          angle: 30,
        },
      ],
    },
    {
      artnr: '42470',
      id: 'roco-42470',
      title: 'BWl5/6',
      type: 'TurnoutCurved',
      segments: [
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 542.8,
          angle: 30,
          length1: 61.6,
          rotationPointOffsetRadius: 46,
        },
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 542.8,
          angle: 30,
        },
      ],
    },
    {
      artnr: '42471',
      id: 'roco-42471',
      title: 'BWr5/6',
      type: 'TurnoutCurved',
      segments: [
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 542.8,
          angle: 30,
          length1: 61.6,
          rotationPointOffsetRadius: 46,
        },
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 542.8,
          angle: 30,
        },
      ],
    },
    {
      artnr: '42476',
      id: 'roco-42476',
      title: 'BWl9/10',
      type: 'TurnoutCurved',
      segments: [
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 826.4,
          angle: 30,
          length1: 61.6,
          rotationPointOffsetRadius: 65,
        },
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 826.4,
          angle: 30,
        },
      ],
    },
    {
      artnr: '42477',
      id: 'roco-42477',
      title: 'BWr9/10',
      type: 'TurnoutCurved',
      segments: [
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 826.4,
          angle: 30,
          length1: 61.6,
        },
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 826.4,
          angle: 30,
        },
      ],
    },
    {
      artnr: '42488',
      id: 'roco-42488',
      title: 'Wl10',
      type: 'Turnout',
      segments: [
        {
          type: 'Straight',
          length: 345,
        },
        {
          type: 'Curve',
          direction: Direction.L,
          radius: 1946,
          angle: 10,
          length1: 7.25,
        },
      ],
    },
    {
      artnr: '42489',
      id: 'roco-42489',
      title: 'Wr10',
      type: 'Turnout',
      segments: [
        {
          type: 'Straight',
          length: 345,
        },
        {
          type: 'Curve',
          direction: Direction.R,
          radius: 1946,
          angle: 10,
          length1: 7.25,
        },
      ],
    },
    {
      artnr: '42493',
      id: 'roco-42493',
      title: 'EKW10',
      type: 'Engels',
      segments: [
        {
          type: 'Straight',
          length: 345,
        },
        {
          type: 'Straight',
          angle: 10,
          length: 345,
        },
      ],
    },
    {
      artnr: '42496',
      id: 'roco-42496',
      title: 'DKW10',
      type: 'Engels',
      segments: [
        {
          type: 'Straight',
          length: 345,
        },
        {
          type: 'Straight',
          angle: 10,
          length: 345,
        },
      ],
    },
    {
      artnr: '42497',
      id: 'roco-42497',
      title: 'K15',
      type: 'Crossing',
      segments: [
        {
          type: 'Straight',
          length: 230,
        },
        {
          type: 'Straight',
          angle: 15,
          length: 230,
        },
      ],
    },
    {
      artnr: '42498',
      id: 'roco-42498',
      title: 'K30',
      type: 'Crossing',
      segments: [
        {
          type: 'Straight',
          length: 119,
        },
        {
          type: 'Straight',
          angle: 30,
          length: 119,
        },
      ],
    },
  ],
};
