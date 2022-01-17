import chalk from 'chalk';
import { printMessageToHex } from '../helpers';
import {
  BIDIB_BUS_ERROR_STRING_MAPPING,
  BIDIB_CRC_ARRAY,
  BIDIB_ERROR_MESSAGE_TYPES,
  BIDIB_MESSAGE_TYPES,
  NodeAddress,
} from './config';
import {
  BIDIB_ERR_BUS,
  BIDIB_ERR_SEQUENCE,
  BIDIB_PKT_ESCAPE,
  BIDIB_PKT_MAGIC,
  MSG_SYS_ERROR,
} from './protocol';
import { sendMessage } from './serial-device';

export function bidibExtractMsgType(message: number[]) {
  let i = 0;
  do {
    i++;
  } while (message[i] != 0x00);
  return message[i + 2];
}

export function bidibExtractAddress(message: number[]) {
  const addr = [];
  let i = 0;

  do {
    addr[i] = message[i + 1];
    i++;
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
  const { type, address, seqnum, payload } = getBidibMssageDetails(message);
  const hex = (val: number) => val.toString(16);
  // MESSAGE ::= MSG_LENGTH  MSG_ADDR  MSG_NUM  MSG_TYPE  DATA
  const messageType = BIDIB_MESSAGE_TYPES[type];
  console.log(
    `Received from: 0x${hex(address[0])} 0x${hex(address[1])} 0x${hex(
      address[2]
    )} 0x${hex(address[3])} seq: ${seqnum} type: ${logColor(
      messageType,
      'blue'
    )} (0x${hex(type)})`
  );

  console.log(printMessageToHex(payload));

  if (type === MSG_SYS_ERROR) {
    console.log('ERROR: ', getErrorDetails(message));
  }
}

export function getErrorDetails(message: Uint8Array) {
  const { firstDataByteIndex } = getBidibMssageDetails(message);
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

export function bidibMessageWithoutData(addr: NodeAddress, msgType: number) {
  // Determine message size
  let messageLength = 0;
  let addrSize = 0;
  if (addr[0] == 0x00) {
    messageLength = 4;
    addrSize = 1;
  } else if (addr[1] == 0x00) {
    messageLength = 5;
    addrSize = 2;
  } else if (addr[2] == 0x00) {
    messageLength = 6;
    addrSize = 3;
  } else {
    messageLength = 7;
    addrSize = 4;
  }

  // Build message
  const message: number[] = [];
  message[0] = messageLength - 1;
  for (let i = 1; i <= addrSize; i++) {
    message[i] = addr[i - 1];
  }
  let seqnum = 0x00;
  // if (bidibSeqNumEnabled) {
  // 	seqnum = bidibNodeStateGetAndIncrSendSeqnum(addr);
  // }
  message[addrSize + 1] = seqnum;
  message[addrSize + 2] = msgType;

  // Buffer message
  return message;
}

export function bidibMessageWithData(
  addr: NodeAddress,
  msgType: number,
  dataLength: number,
  data: number[]
) {
  // Determine message size
  let messageLength = dataLength;
  let addrSize = 0;
  if (addr[0] == 0x00) {
    messageLength += 4;
    addrSize = 1;
  } else if (addr[1] == 0x00) {
    messageLength += 5;
    addrSize = 2;
  } else if (addr[2] == 0x00) {
    messageLength += 6;
    addrSize = 3;
  } else {
    messageLength += 7;
    addrSize = 4;
  }

  // Build message
  let message: number[] = [];
  message[0] = messageLength - 1;
  for (let i = 1; i <= addrSize; i++) {
    message[i] = addr[i - 1];
  }
  let seqnum = 0x00;
  // if (bidibSeqNumEnabled) {
  // 	seqnum = bidib_node_state_get_and_incr_send_seqnum(addr);
  // }
  message[addrSize + 1] = seqnum;
  message[addrSize + 2] = msgType;
  for (let i = 0; i < dataLength; i++) {
    message[addrSize + 3 + i] = data[i];
  }

  return message;
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

async function wait(waitTimeMS: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, waitTimeMS);
  });
}

function getCRC(message: number[]) {
  let crc = 0;
  for (let i = 0; i < message.length; i++) {
    crc = BIDIB_CRC_ARRAY[message[i] ^ crc];
  }
  return crc;
}

export function sendMessagesWithoutData(
  addr: NodeAddress,
  messageCodes: number[]
) {
  for (const messageCode of messageCodes) {
    switch (messageCode) {
      default:
        {
          const message = bidibMessageWithoutData(addr, messageCode);
          sendMessage(message);
          const crc = getCRC(message);
          sendMessage([crc]);
        }
        break;
      case BIDIB_PKT_MAGIC:
        sendMessage([BIDIB_PKT_MAGIC]);
        break;
    }
  }
}

export function getBidibMssageDetails(message: Uint8Array) {
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
