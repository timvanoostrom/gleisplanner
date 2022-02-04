import { hexToString, stringToHex } from '../../helpers';
import {
  BidibLinkDescriptor,
  BIDIB_PROTOCOL_HIGH,
  BIDIB_PROTOCOL_LOW,
  CS_NODE_ADDRESS,
} from '../config';
import { getDescriptorValue } from '../connection-registry';
import {
  NetMessageHandlerCombo,
  netSend,
  setPaired,
} from '../netbidib-receiver';
import {
  Ds_BidibLocal,
  NetBidibLocalLink,
  UDs_BidibLocal,
  Us_BidibLocal,
} from '../protocol';
import { bidibMessageWithData } from '../serial-device';
import {
  BidibMessageDetails,
  getBidibProtocolVersion,
  getUID,
  MessageData,
  wait,
} from '../utils';

export function exchangeProtocolSignature({
  data: dataPayload,
  type: messageType,
}: BidibMessageDetails) {
  const clientProtocolSignature = hexToString(dataPayload);

  console.log('<<', UDs_BidibLocal[messageType], clientProtocolSignature);

  const hostProtocolSignatureString = stringToHex(
    BidibLinkDescriptor.signature
  );
  const data = hostProtocolSignatureString;

  const protocolSignatureReply = bidibMessageWithData(
    CS_NODE_ADDRESS,
    UDs_BidibLocal.MSG_LOCAL_PROTOCOL_SIGNATURE,
    data
  );

  return netSend(protocolSignatureReply);
}

export const protocolSignatureHandler: NetMessageHandlerCombo = [
  UDs_BidibLocal.MSG_LOCAL_PROTOCOL_SIGNATURE,
  exchangeProtocolSignature,
];

function getDescriptorReplies() {
  const replies = [];
  {
    const data = [
      NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_P_VERSION,
      ...getDescriptorValue('pVersion'),
    ];
    const descriptorProtocolReply = bidibMessageWithData(
      CS_NODE_ADDRESS,
      UDs_BidibLocal.MSG_LOCAL_LINK,
      data
    );
    replies.push(descriptorProtocolReply);
  }
  {
    const data = [
      NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_PROD_STRING,
      ...stringToHex(getDescriptorValue('prod')),
    ];
    const descriptorUserStringReply = bidibMessageWithData(
      CS_NODE_ADDRESS,
      UDs_BidibLocal.MSG_LOCAL_LINK,
      data
    );
    replies.push(descriptorUserStringReply);
  }
  {
    const data = [
      NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_USER_STRING,
      ...stringToHex(getDescriptorValue('user')),
    ];
    const descriptorUserStringReply = bidibMessageWithData(
      CS_NODE_ADDRESS,
      UDs_BidibLocal.MSG_LOCAL_LINK,
      data
    );
    replies.push(descriptorUserStringReply);
  }
  {
    const data = [
      NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_UID,
      ...getDescriptorValue('uid'),
    ];
    const descriptorUIDReply = bidibMessageWithData(
      CS_NODE_ADDRESS,
      UDs_BidibLocal.MSG_LOCAL_LINK,
      data
    );
    replies.push(descriptorUIDReply);
  }

  return replies;
}

export async function establishLocalLink(messageDetails: BidibMessageDetails) {
  const { data: dataPayload } = messageDetails;
  const subMessageType = dataPayload[0];
  const subDataPayload = dataPayload.slice(1);

  switch (subMessageType) {
    case NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_UID:
      {
        console.log(
          '<<',
          NetBidibLocalLink[subMessageType],
          getUID({ data: subDataPayload })
        );

        const replies = getDescriptorReplies();
        netSend(replies);
      }
      break;
    case NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_P_VERSION:
      console.log(
        '<<',
        NetBidibLocalLink[subMessageType],
        getBidibProtocolVersion({ data: subDataPayload })
      );
      break;
    case NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_USER_STRING:
      console.log(
        '<<',
        NetBidibLocalLink[subMessageType],
        hexToString(subDataPayload)
      );
      break;
    case NetBidibLocalLink.BIDIB_LINK_DESCRIPTOR_PROD_STRING:
      console.log(
        '<<',
        NetBidibLocalLink[subMessageType],
        hexToString(subDataPayload)
      );
      break;
    case NetBidibLocalLink.BIDIB_LINK_PAIRING_REQUEST:
      {
        // 2..8:sender_uid, 9..15:receiver_uid
        const senderUID = subDataPayload.slice(0, 7);
        const receiverUID = subDataPayload.slice(7);

        console.log(
          '<<',
          NetBidibLocalLink[subMessageType],
          '[',
          getUID({ data: receiverUID }),
          '] <> [',
          getUID({ data: senderUID }),
          ']'
        );

        const data = [
          NetBidibLocalLink.BIDIB_LINK_STATUS_PAIRED,
          ...receiverUID,
          ...senderUID,
        ];

        const pairingTrustReply = bidibMessageWithData(
          CS_NODE_ADDRESS,
          UDs_BidibLocal.MSG_LOCAL_LINK,
          data
        );

        // initiate some pairing control button and or dialog
        await wait(2000); // simulate a button press in x seconds
        netSend(pairingTrustReply);
      }
      break;
    case NetBidibLocalLink.BIDIB_LINK_STATUS_PAIRED:
      {
        // 2..8:sender_uid, 9..15:receiver_uid
        const senderUID = subDataPayload.slice(0, 7);
        const receiverUID = subDataPayload.slice(7);
        console.log(
          '<<',
          NetBidibLocalLink[subMessageType],
          '[',
          getUID({ data: senderUID }),
          '] <> [',
          getUID({ data: receiverUID }),
          ']'
        );

        const data = getDescriptorValue('uid');

        const localLogonReply = bidibMessageWithData(
          CS_NODE_ADDRESS,
          Us_BidibLocal.MSG_LOCAL_LOGON,
          data
        );

        netSend(localLogonReply);
      }
      break;
  }
}

export const localLinkHandler: NetMessageHandlerCombo = [
  UDs_BidibLocal.MSG_LOCAL_LINK,
  establishLocalLink,
];

function localLogonAck() {
  setPaired(true);
}

export const localLogonHandler: NetMessageHandlerCombo = [
  Ds_BidibLocal.MSG_LOCAL_LOGON_ACK,
  localLogonAck,
];

function localLogonRejected() {
  setPaired(false);
  console.error('The Local Logon was rejected');
}

export const localLogonRejectedHandler: NetMessageHandlerCombo = [
  Ds_BidibLocal.MSG_LOCAL_LOGON_REJECTED,
  localLogonRejected,
];
