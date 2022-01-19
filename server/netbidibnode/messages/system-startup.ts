import { NodeAddress } from '../config';
import {
  BIDIB_PKT_MAGIC,
  MSG_NODETAB_COUNT,
  MSG_NODETAB_GETALL,
  MSG_SYS_ENABLE,
  MSG_SYS_GET_MAGIC,
  MSG_SYS_GET_P_VERSION,
  MSG_SYS_GET_SW_VERSION,
  MSG_SYS_GET_UNIQUE_ID,
  MSG_SYS_P_VERSION,
  MSG_SYS_SW_VERSION,
  MSG_SYS_UNIQUE_ID,
} from '../protocol';
import { sendMessagesWithoutData } from '../serial-device';
import { getBidibMessageDetails, getUID, logColor } from '../utils';

export function sendBidibControlStationStartup(nodeAddress: NodeAddress) {
  sendMessagesWithoutData(nodeAddress, [
    BIDIB_PKT_MAGIC,
    BIDIB_PKT_MAGIC,
    MSG_SYS_GET_MAGIC,
    MSG_SYS_GET_UNIQUE_ID,
    MSG_SYS_GET_P_VERSION,
    MSG_SYS_GET_SW_VERSION,
    MSG_NODETAB_GETALL,
    MSG_SYS_ENABLE,
  ]);
}

export function handleBidibControlStationStartupMessage(
  message: Uint8Array | null
) {
  if (!message) {
    return;
  }
  const { type, payload, firstDataByteIndex } = getBidibMessageDetails(message);

  switch (type) {
    case MSG_SYS_UNIQUE_ID:
      // 1:class, 2:classx, 3:vid, 4..7:pid+uid, [7..11: config_fingerprint]
      console.log(
        'GOT THE ID YEAH!',
        logColor(getUID(payload, firstDataByteIndex))
      );
      break;
    case MSG_SYS_P_VERSION:
      const protocolVersion = payload
        .slice(firstDataByteIndex, firstDataByteIndex + 2)
        .reverse()
        .join('.');

      console.log(`And the Protocol version is...${logColor(protocolVersion)}`);
      break;
    case MSG_SYS_SW_VERSION:
      const softwareVersion = payload
        .slice(firstDataByteIndex, firstDataByteIndex + 3)
        .map((n, i) => {
          return i === 0 ? `V${n}` : `${n}`.padStart(2, '0');
        })
        .join('.');

      console.log('And the Software version is...', logColor(softwareVersion));
      break;
    case MSG_NODETAB_COUNT:
      console.log(
        'And the Node count is...',
        logColor(`${payload[firstDataByteIndex]}`)
      );
      break;
  }
}
