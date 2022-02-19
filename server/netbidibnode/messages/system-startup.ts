import { hexToString } from '../../helpers';
import { BidibMessage, NodeAddress } from '../config';
import {
  serialInterfaceDescriptor,
  setDescriptorValue,
} from '../connection-registry';
import {
  BidibSerialLink,
  Ds_BidibSystem,
  NetBidibLocalLink,
  Us_BidibSystem,
} from '../protocol';
import {
  addLineItems,
  lineItemMessageNoReply,
  lineItemSimpleMessage,
} from '../serial-queue';
import {
  getBidibProtocolVersion,
  getBidibSerialMessageDetails,
  getBidibSoftwareVersion,
  getUID,
  logColor,
} from '../utils';

export function sendBidibControlStationStartup(nodeAddress: NodeAddress) {
  addLineItems(
    lineItemMessageNoReply(nodeAddress, BidibSerialLink.BIDIB_PKT_MAGIC),
    lineItemMessageNoReply(nodeAddress, BidibSerialLink.BIDIB_PKT_MAGIC),
    lineItemSimpleMessage(
      nodeAddress,
      Ds_BidibSystem.MSG_SYS_GET_MAGIC,
      Us_BidibSystem.MSG_SYS_MAGIC
    ),
    lineItemSimpleMessage(
      nodeAddress,
      Ds_BidibSystem.MSG_SYS_GET_UNIQUE_ID,
      Us_BidibSystem.MSG_SYS_UNIQUE_ID,
      handleBidibControlStationStartupMessage
    ),
    lineItemSimpleMessage(
      nodeAddress,
      Ds_BidibSystem.MSG_SYS_GET_P_VERSION,
      Us_BidibSystem.MSG_SYS_P_VERSION,
      handleBidibControlStationStartupMessage
    ),
    lineItemSimpleMessage(
      nodeAddress,
      Ds_BidibSystem.MSG_SYS_GET_SW_VERSION,
      Us_BidibSystem.MSG_SYS_SW_VERSION,
      handleBidibControlStationStartupMessage
    )
    // lineItemSimpleMessage(
    //   nodeAddress,
    //   NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_PROD_STRING,
    //   NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_PROD_STRING,
    //   handleBidibControlStationStartupMessage
    // )
  )();
}

export function handleBidibControlStationStartupMessage(message: BidibMessage) {
  const messageDetails = getBidibSerialMessageDetails(message);
  const { type: messageType } = messageDetails;

  switch (messageType) {
    case Us_BidibSystem.MSG_SYS_UNIQUE_ID:
      {
        const uid = getUID(messageDetails);
        console.log('\t- GOT THE ID YEAH!', logColor(uid));
        setDescriptorValue('uid', messageDetails.data);
      }
      break;
    case Us_BidibSystem.MSG_SYS_P_VERSION:
      {
        const protocolVersion = getBidibProtocolVersion(messageDetails);
        console.log(
          `\t- And the Protocol version is...`,
          logColor(protocolVersion)
        );
        setDescriptorValue('pVersion', messageDetails.data);
      }
      break;
    case Us_BidibSystem.MSG_SYS_SW_VERSION:
      {
        const softwareVersion = getBidibSoftwareVersion(messageDetails);
        console.log(
          '\t- And the Software version is...',
          logColor(softwareVersion)
        );
        setDescriptorValue('swVersion', messageDetails.data);
      }
      break;
    case NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_PROD_STRING:
      {
        console.log('LINK!', hexToString(messageDetails.data));
      }
      break;
  }
}
