import chalk from 'chalk';
import { printMessageToHex } from '../helpers';
import {
  BIDIB_BUS_ERROR_STRING_MAPPING,
  BIDIB_CRC_ARRAY,
  BIDIB_ERROR_MESSAGE_TYPES,
  BIDIB_MESSAGE_TYPES,
} from './config';
import {
  BIDIB_ERR_BUS,
  BIDIB_ERR_SEQUENCE,
  BIDIB_PKT_ESCAPE,
  BIDIB_PKT_MAGIC,
  MSG_SYS_ERROR,
} from './protocol';

export function bidibExtractMsgType(message: number[]) {
  let i = 0;
  do {
    i++;
    // console.log('get.type');
  } while (message[i] != 0x00);
  return message[i + 2];
}

export function bidibExtractAddress(message: number[]) {
  const addr = [];
  let i = 0;

  do {
    addr[i] = message[i + 1];
    i++;
    // console.log('get.addr');
  } while (message[i] != 0x00);

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
    if (message[i] == 0x00) {
      return i + 3;
    }
  }
  return -1;
}

export function bidibLogReceivedMessage(message: Uint8Array) {
  const { type, address, seqnum, payload } = getBidibMessageDetails(message);
  const hex = (val: number) => val.toString(16);
  // MESSAGE ::= MSG_LENGTH  MSG_ADDR  MSG_NUM  MSG_TYPE  DATA
  const messageType = BIDIB_MESSAGE_TYPES[type];
  console.log(
    `<< ${logColor(messageType, 'blue')} ${printMessageToHex(
      payload
    )} from: 0x${hex(address[0])} 0x${hex(address[1])} 0x${hex(
      address[2]
    )} 0x${hex(address[3])} seq: ${seqnum})`
  );

  if (type === MSG_SYS_ERROR) {
    console.log(chalk.bgRed(chalk.white('ERROR: ', getErrorDetails(message))));
  }
}

export function bidibLogSentMessage(message: Uint8Array | number[]) {
  const { type, address, seqnum, payload } = getBidibMessageDetails(message);
  const hex = (val: number) => val.toString(16);
  // MESSAGE ::= MSG_LENGTH  MSG_ADDR  MSG_NUM  MSG_TYPE  DATA
  const messageType = BIDIB_MESSAGE_TYPES[type];
  console.log(
    `>> ${logColor(messageType, 'redBright')} ${printMessageToHex(
      Array.from(message)
    )} to: 0x${hex(address[0])} 0x${hex(address[1])} 0x${hex(
      address[2]
    )} 0x${hex(address[3])} seq: ${seqnum})`
  );
}

export function getErrorDetails(message: Uint8Array) {
  const { firstDataByteIndex } = getBidibMessageDetails(message);
  const errorType = message[firstDataByteIndex];

  let error = 'UNKNOWN';

  if (errorType <= 0x30) {
    switch (errorType) {
      case BIDIB_ERR_SEQUENCE:
        error = `Expected MSG_NUM ${message[firstDataByteIndex + 1]}`;
        break;
      case BIDIB_ERR_BUS:
        error = BIDIB_BUS_ERROR_STRING_MAPPING[message[firstDataByteIndex + 1]];
        break;
      default:
        error = BIDIB_ERROR_MESSAGE_TYPES[errorType];
        break;
    }
  }

  return error;
}

export function getUID(payload: number[], firstDataByteIndex: number) {
  const messageContents = payload
    .slice(firstDataByteIndex, firstDataByteIndex + 9)
    .map((n) => n.toString(16));
  const nClass = messageContents[0];
  const nClassX = messageContents[1];
  const vid = messageContents[2];
  const piduid = messageContents.slice(3, 6).join('');
  const configFingerprint = messageContents.slice(6, 10).join('');
  const uid =
    `${nClass} V ${nClassX}${vid} P ${piduid}${configFingerprint}`.toUpperCase();
  return uid;
}

export function logColor(version: string, color: string = 'redBright') {
  return chalk.bold((chalk as any)?.[color](`${version}`));
}

function bidibSendByte(b: number) {
  const message = [];
  if (b == BIDIB_PKT_MAGIC || b == BIDIB_PKT_ESCAPE) {
    message.push(BIDIB_PKT_ESCAPE);
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

export function getBidibMessageDetails(message: Uint8Array | number[]) {
  const payload = Array.from(message);
  const type = bidibExtractMsgType(payload);
  const address = bidibExtractAddress(payload);
  const seqnum = bidibExtractSeqNum(payload);
  const firstDataByteIndex = bidibFirstDataByteIndex(payload);

  return {
    payload,
    type,
    address,
    seqnum,
    firstDataByteIndex,
  };
}
