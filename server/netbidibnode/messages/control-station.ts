import { NodeAddress } from '../config';
import { BIDIB_PKT_MAGIC, MSG_CS_STATE } from '../protocol';
import {
  getBidibMssageDetails,
  logColor,
  sendMessagesWithoutData,
} from '../utils';

export enum BidibSysState {
  BIDIB_CS_STATE_OFF = 0x00, // no DCC, DCC-line is static, not toggling
  BIDIB_CS_STATE_STOP = 0x01, // DCC, all speed setting = 0
  BIDIB_CS_STATE_SOFTSTOP = 0x02, // DCC, soft stop is progress
  BIDIB_CS_STATE_GO = 0x03, // DCC on (must be repeated if watchdog is on)
  BIDIB_CS_STATE_GO_IGN_WD = 0x04, // DCC on (watchdog ignored)
  BIDIB_CS_STATE_PROG = 0x08, // in Programming Mode (ready for commands)
  BIDIB_CS_STATE_PROGBUSY = 0x09, // in Programming Mode (busy)
  BIDIB_CS_STATE_BUSY = 0x0d, // busy
  BIDIB_CS_STATE_QUERY = 0xff,
}

type BidibSendSysState =
  | BidibSysState.BIDIB_CS_STATE_OFF
  | BidibSysState.BIDIB_CS_STATE_STOP
  | BidibSysState.BIDIB_CS_STATE_GO_IGN_WD
  | BidibSysState.BIDIB_CS_STATE_GO;

export function handleBidibControlStationStartupMessage(message: Uint8Array) {
  const { type, payload, firstDataByteIndex } = getBidibMssageDetails(message);

  switch (type) {
    case MSG_CS_STATE:
      const state = payload[firstDataByteIndex];
      console.log('And the State is...', logColor(`${BidibSysState[state]}`));
      break;
  }
}

export function sendCsState(addr: NodeAddress, state: BidibSendSysState) {
  sendMessagesWithoutData(addr, [BIDIB_PKT_MAGIC, state]);
}
