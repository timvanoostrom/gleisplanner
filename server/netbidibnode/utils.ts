import chalk from 'chalk';
import { hexStr, printMessageToHex } from '../helpers';
import {
  BidibMessage,
  BidibMessageType,
  BIDIB_BUS_ERROR_STRING_MAPPING,
  BIDIB_CRC_ARRAY,
  NodeAddress,
  UNKNOWN,
} from './config';
import {
  BidibErrorCode,
  BidibMessages,
  BidibSerialLink,
  Us_BidibSystem,
} from './protocol';
import * as messages from './protocol';

export function bidibExtractMsgType(message: number[]) {
  let i = 0;
  do {
    i++;
    // console.log('get.type');
  } while (message[i] !== 0x00);
  return message[i + 2];
}

export function bidibExtractAddress(message: number[]): NodeAddress {
  const addr: NodeAddress = [0, 0, 0, 0];
  let i = 0;

  do {
    addr[i] = message[i + 1];
    i++;
    // console.log('get.addr');
  } while (message[i] !== 0x00);

  while (i < 4) {
    addr[i] = 0x00;
    i++;
  }

  return addr;
}

export function bidibExtractSeqNum(message: number[]) {
  let i = 1;
  while (message[i] != 0x00) {
    i++;
    // console.log('get.seqnum');
  }
  return message[++i];
}

export function bidibFirstDataByteIndex(message: number[]) {
  for (let i = 1; i <= message[0] - 3; i++) {
    if (message[i] === 0x00) {
      return i + 3;
    }
  }
  return -1;
}

const messageTypes = Object.fromEntries(
  Object.entries(messages)
    .filter(([enumName]) => {
      return enumName in BidibMessages;
    })
    .flatMap(([, enumValues]) => Object.entries(enumValues))
);

export function getBidibMessageType(messageType: number): string {
  if (!messageType) {
    return UNKNOWN;
  }
  return messageTypes[messageType] + '' || UNKNOWN;
}

function bidibLogMessage(
  { type, address, seqnum, payload }: BidibMessageDetails,
  direction: 'in' | 'out'
) {
  // MESSAGE ::= MSG_LENGTH  MSG_ADDR  MSG_NUM  MSG_TYPE  DATA
  const dir = direction === 'in' ? '<<' : '>>';
  const color = direction === 'in' ? 'blue' : 'redBright';
  const messageType = getBidibMessageType(type);

  const hexPayload = printMessageToHex(payload);
  // prettier-ignore
  const hexAddress = `${hexStr(address[0])} ${hexStr(address[1])} ${hexStr(address[2])} ${hexStr(address[3])}`;
  // prettier-ignore
  console.log(`${dir} ${logColor(messageType, color)} ${hexPayload} to: ${hexAddress} seq: ${seqnum})`
  );
}

export function bidibLogReceivedMessage(message: BidibMessage) {
  const messageDetails = getBidibMessageDetails(message);
  const { type: messageType } = messageDetails;
  // bidibLogMessage(messageDetails, 'in');

  if (messageType === Us_BidibSystem.MSG_SYS_ERROR) {
    console.log(chalk.bgRed(chalk.white('ERROR: ', getErrorDetails(message))));
  }
}

export function bidibLogSentMessage(message: BidibMessage) {
  const messageDetails = getBidibMessageDetails(message);
  // bidibLogMessage(messageDetails, 'out');
}

export function getErrorDetails(message: BidibMessage) {
  const { firstDataByteIndex } = getBidibMessageDetails(message);
  const errorType = message[firstDataByteIndex];

  let error = 'UNKNOWN';

  if (errorType <= 0x30) {
    switch (errorType) {
      case BidibErrorCode.BIDIB_ERR_SEQUENCE:
        error = `Expected MSG_NUM ${message[firstDataByteIndex + 1]}`;
        break;
      case BidibErrorCode.BIDIB_ERR_BUS:
        error = BIDIB_BUS_ERROR_STRING_MAPPING[message[firstDataByteIndex + 1]];
        break;
      default:
        error = BidibErrorCode[errorType];
        break;
    }
  }

  return error;
}

export interface BidibMessageDetails {
  payload: BidibMessage;
  type: BidibMessageType;
  address: NodeAddress;
  seqnum: number;
  firstDataByteIndex: number;
  data: number[];
}

export type MessageData = Pick<BidibMessageDetails, 'data'>;

export function getUID({ data }: MessageData) {
  // 1:class, 2:classx, 3:vid, 4..7:pid+uid, [7..11: config_fingerprint]
  const messageContents = data.slice(0, 10).map((n) => hexStr(n, false));
  const nClass = messageContents[0];
  const nClassX = messageContents[1]; // 0x00
  const vid = messageContents[2]; // 0x0d
  const piduid = messageContents.slice(3, 7);
  const configFingerprint = messageContents.slice(7).join('');
  const uid = `V ${vid} P ${piduid.join('')}`.toUpperCase();
  return uid;
}

export function logColor(version: string, color: string = 'redBright') {
  return chalk.bold((chalk as any)?.[color](`${version}`));
}

function bidibSendByte(b: number) {
  const message = [];
  if (
    b == BidibSerialLink.BIDIB_PKT_MAGIC ||
    b == BidibSerialLink.BIDIB_PKT_ESCAPE
  ) {
    message.push(BidibSerialLink.BIDIB_PKT_ESCAPE);
    b = b ^ 0x20;
  }
  message.push(b);
}

export async function wait(waitTimeMS: number) {
  console.log(`Waiting for ${waitTimeMS}ms`);
  return new Promise((resolve) => {
    setTimeout(resolve, waitTimeMS);
  });
}

export function getCRC(message: number[]) {
  let crc = 0;
  for (let i = 0; i < message.length; i++) {
    crc = BIDIB_CRC_ARRAY[message[i] ^ crc];
  }
  return crc;
}

export function getBidibMessageDetails(
  payload: BidibMessage,
  popCRC: boolean = false
): BidibMessageDetails {
  const type = bidibExtractMsgType(payload);
  const address = bidibExtractAddress(payload);
  const seqnum = bidibExtractSeqNum(payload);
  const firstDataByteIndex = bidibFirstDataByteIndex(payload);
  const data = payload.slice(firstDataByteIndex);

  if (popCRC) {
    data.pop();
  }

  return {
    payload,
    type,
    address,
    seqnum,
    firstDataByteIndex,
    data,
  };
}

export function getBidibSerialMessageDetails(payload: BidibMessage) {
  return getBidibMessageDetails(payload, true);
}

export function getBidibProtocolVersion({ data }: MessageData) {
  const protocolVersion = data.slice(0, 2).reverse().join('.');
  return protocolVersion;
}

export function getBidibSoftwareVersion({ data }: MessageData) {
  const softwareVersion = data
    .slice(0, 3)
    .map((n, i) => {
      return i === 0 ? `V${n}` : `${n}`.padStart(2, '0');
    })
    .join('.');

  return softwareVersion;
}

// const t = [
//   0x18, 0x00, 0x00, 0xff, 0x00, 0x13, 0x42, 0x69, 0x44, 0x69, 0x42, 0x2d, 0x57,
//   0x69, 0x7a, 0x61, 0x72, 0x64, 0x2d, 0x43, 0x6c, 0x69, 0x65, 0x6e, 0x74,

//   0x0b, 0x00, 0x00, 0xff, 0x01, 0x06, 0x43, 0x6c, 0x69, 0x65, 0x6e, 0x74,

//   0x06, 0x00, 0x00, 0xff, 0x80, 0x08, 0x00,
// ];

// console.log(splitMessages(t).map((m) => m.map((n) => n.toString(16))));

export function splitMessages(message: BidibMessage) {
  const splitted = [];

  let index = 0;
  let totalLen = message.length;

  while (index < totalLen) {
    const len = message[index];
    const end = index + (len + 1);
    const start = index;
    const nMessage = message.slice(start, end);

    splitted.push(nMessage);
    index = end;
  }

  return splitted;
}

// Get the (unsigned) int value from the low and high byte value.
export function getInt(lowByte: number, highByte: number) {
  return ((highByte & 0xff) << 8) + (lowByte & 0xff);
}
//0xfd, 0xde
//((0xfd & 0xff) << 8) + (0xde & 0xff)

export function unescapeMessageBytes(message: BidibMessage) {
  const unescapedMessage = [];
  let escapedNextByte = false;
  for (const n of message) {
    if (n === BidibSerialLink.BIDIB_PKT_ESCAPE) {
      escapedNextByte = true;
    } else if (escapedNextByte) {
      unescapedMessage.push(n ^ 0x20);
      escapedNextByte = false;
    } else {
      unescapedMessage.push(n);
    }
  }
  return unescapedMessage;
}

const stripBytesFromSerialMessage = [BidibSerialLink.BIDIB_PKT_MAGIC];

export function prepareNetMessageFromSerial(message: BidibMessage) {
  // Remove the CRC value
  message.pop();
  const messageUnescaped = unescapeMessageBytes(message);

  return messageUnescaped;
}
