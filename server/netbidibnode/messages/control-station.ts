import { BidibMessage, NodeAddress } from '../config';
import { BidibCsState, Ds_BidibDCC, Us_BidibDCC } from '../protocol';
import { sendMessagesWithData } from '../serial-device';
import { getBidibMessageDetails, logColor } from '../utils';

export function handleBidibControlStationMessage(message: BidibMessage) {
  const { type, payload, firstDataByteIndex } = getBidibMessageDetails(message);

  switch (type) {
    case Us_BidibDCC.MSG_CS_STATE:
      const state = payload[firstDataByteIndex];
      console.log('And the State is...', logColor(`${BidibCsState[state]}`));
      break;
  }
}

export function sendCsState(addr: NodeAddress, state: BidibCsState) {
  const message = [Ds_BidibDCC.MSG_CS_SET_STATE, state];
  sendMessagesWithData(addr, [message]);
}
