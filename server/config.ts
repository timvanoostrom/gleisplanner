//DCC Speed Steps
export const DCCSTEP14 = 0x01;
export const DCCSTEP28 = 0x02;
export const DCCSTEP128 = 0x03;

export const speedSteps = {
  ['' + DCCSTEP14]: '14 steps',
  ['' + DCCSTEP28]: '28 steps',
  ['' + DCCSTEP128]: '128 steps',
};

export const DIRECTION_FORWARD = 1;
export const DIRECTION_BACKWARD = 0;

export const directions = {
  ['' + DIRECTION_FORWARD]: 'FORWARD',
  ['' + DIRECTION_BACKWARD]: 'BACKWARD',
};
