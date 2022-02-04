import { BidibMessage, NodeAddress } from '../config';
import { Ds_BidibSystem, Us_BidibSystem } from '../protocol';
import { sendMessagesWithoutData } from '../serial-device';
import { getBidibMessageDetails, logColor } from '../utils';

export function sendBidibNodeTabGetAll(nodeAddress: NodeAddress) {
  sendMessagesWithoutData(nodeAddress, [Ds_BidibSystem.MSG_NODETAB_GETALL]);
}

export function sendBidibNodeTabGetNext(
  nodeAddress: NodeAddress,
  nodeCount: number
) {
  for (let i = 0; i < nodeCount; i++) {
    sendMessagesWithoutData(nodeAddress, [Ds_BidibSystem.MSG_NODETAB_GETNEXT]);
  }
}

export function handleBidibNodeTabMessage(message: BidibMessage | null) {
  if (!message) {
    return;
  }
  const { type, payload, firstDataByteIndex } = getBidibMessageDetails(message);

  switch (type) {
    case Us_BidibSystem.MSG_NODETAB_COUNT:
      console.log(
        'And the Node count is...',
        logColor(`${payload[firstDataByteIndex]}`)
      );
      break;
  }
}
