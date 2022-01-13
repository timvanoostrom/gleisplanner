import { getDCCAddress, xor } from '../../helpers';
import { getXHeader } from '../helpers';
import { messages } from '../z21-protocol';

type DecoderAddress = number;

enum TurnoutState {
  STRAIGHT = 0x02,
  BRANCHED = 0x01,
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

function createTurnoutInfoPayload(address: DecoderAddress) {
  // Convert back to the byte/bit values for the CV's ??????
  const adrMSB = (address >> 8) & 0xff;
  const adrLSB = (address & 0xff) - 1; // always -1
  const state = getTurnoutState(address);
  const payload = [...messages.LAN_X_TURNOUT_INFO, adrMSB, adrLSB, state];
  payload.push(xor(payload.slice(4)));

  return payload;
}

export function LAN_X_TURNOUT_INFO(message: Uint8Array) {
  const xHeader = getXHeader(message);
  const address = getDCCAddress(message[5], message[6]);

  // TODO: Add reference to source on GH
  const turnoutStatePayload = message[7];
  const activate = (turnoutStatePayload & 0x08) === 0x08 ? 1 : 0;
  const state =
    (turnoutStatePayload & 0x09) === 0x09
      ? TurnoutState.STRAIGHT
      : TurnoutState.BRANCHED;

  switch (xHeader) {
    // When/how/why do we get incoming turnout_info ?
    case getXHeader(messages.LAN_X_TURNOUT_INFO):
      // Act upon incoming info message
      // if (activate) {
      //   setTurnoutState(address, state);
      // }
      return createTurnoutInfoPayload(address);

    case getXHeader(messages.LAN_X_SET_TURNOUT):
      // 10Q0A00P
      //
      // 10001000 = 136 = 0x88
      // 10000000 = 128 = 0x80
      //
      // 10001001 = 137 = 0x89
      // 10000001 = 129 = 0x81

      if (activate) {
        setTurnoutState(address, state);
      }
      return createTurnoutInfoPayload(address);

    case getXHeader(messages.LAN_X_GET_TURNOUT_INFO):
      return createTurnoutInfoPayload(address);

    default:
      return [];
  }
}

export function LAN_X_SET_TURNOUT(message: Uint8Array) {
  return LAN_X_TURNOUT_INFO(message);
}
