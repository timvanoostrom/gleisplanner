import { messages } from '../z21-protocol';
import { xor } from '../helpers';

function getTurnoutAddress(addrMsb: number, addrLsb: number) {
  return (addrMsb << 8) + addrLsb + 1;
}

type DecoderAddress = number;

enum TurnoutState {
  STRAIGHT = 0x01,
  BRANCHED = 0x02,
  NOTSET = 0x00,
  MIXED = 0x11,
}

const DEFAULT_STATE = TurnoutState.NOTSET;

const turnoutState = new Map<DecoderAddress, TurnoutState>();

function getTurnoutState(address: DecoderAddress) {
  return turnoutState.get(address) || DEFAULT_STATE;
}

function setTurnoutState(address: DecoderAddress, state: TurnoutState) {
  console.log(
    '::::: set state',
    state === TurnoutState.BRANCHED ? 'BRANCHED' : 'STRAIGHT'
  );
  turnoutState.set(address, state);
}

function createTurnoutInfoPayload(
  address: DecoderAddress,
  requestMessage: Uint8Array
) {
  // const adrMSB = (address >> 8) & 0xff;
  // const adrLSB = address & 0xff;
  const adrMSB = requestMessage[5];
  const adrLSB = requestMessage[6];
  const state = getTurnoutState(address);
  const payload = [...messages.LAN_X_TURNOUT_INFO, adrMSB, adrLSB, state];
  payload.push(xor(payload.slice(4)));

  return payload;
}

export function LAN_X_TURNOUT_INFO(message: Uint8Array) {
  const xHeader = message[4];
  const address = getTurnoutAddress(message[5], message[6]);

  const statePayload = message[7];
  const activate = (statePayload & 0x08) === 0x08 ? 1 : 0;
  const state =
    (statePayload & 0x09) === 0x09
      ? TurnoutState.BRANCHED
      : TurnoutState.STRAIGHT;

  let payload: number[] = [];

  console.log(
    '\n',
    '-'.repeat(20),
    '\n',
    address,
    '>>',
    state === TurnoutState.BRANCHED ? 'BRANCHED' : 'STRAIGHT',
    ':',
    activate ? 'pressed' : 'released',
    '\n',
    '-'.repeat(20),
    '\n'
  );

  switch (xHeader) {
    // When/how/why do we get incoming turnout_info ?
    case messages.LAN_X_TURNOUT_INFO[4]:
      // Act upon incoming info message
      // if (activate) {
      //   setTurnoutState(address, state);
      // }
      return createTurnoutInfoPayload(address, message);

    case messages.LAN_X_SET_TURNOUT[4]:
      // 10Q0A00P
      //
      // 10001000 = 136 = 0x88
      // 10000000 = 128 = 0x80
      //
      // 10001001 = 137 = 0x89
      // 10000001 = 129 = 0x81

      // const queue = (state & 0x20) == 0x20;
      // const output2 = ~(state | 0xfe); // see https://github.com/PaulVdBergh/TripleBTrains;
      // const state2 = (state & 0x08) >> 3;

      // https://github.com/GBert/railroad/blob/8ff411d30250e04fc5eddd777650b83fe45810d6/z21/src/z21emu.c

      if (activate) {
        setTurnoutState(address, state);
      }
      return createTurnoutInfoPayload(address, message);

    case messages.LAN_X_GET_TURNOUT_INFO[4]:
      return createTurnoutInfoPayload(address, message);

    default:
      return [];
  }
}

export function LAN_X_SET_TURNOUT(message: Uint8Array) {
  return LAN_X_TURNOUT_INFO(message);
}
