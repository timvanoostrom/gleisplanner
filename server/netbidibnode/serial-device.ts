import SerialPort from 'serialport';
import { printMessageToHex } from '../helpers';
import { BidibMessage, BidibMessageType, NodeAddress } from './config';
import { BidibSerialLink } from './protocol';
import { bidibLogSentMessage, getCRC } from './utils';

export const Delimiter = require('@serialport/parser-delimiter');
const path = '/dev/tty.usbserial-AH05R7PP';

let serialport: SerialPort | null = null;
let serialparser: NodeJS.WritableStream | null = null;

const DEFAULT_SERIAL_PORT_OPTIONS = {
  baudRate: 115200,
};

export function openSerialPort(
  options: Record<string, any> = DEFAULT_SERIAL_PORT_OPTIONS
) {
  return new Promise<{ port: SerialPort; parser: NodeJS.WritableStream }>(
    (resolve, reject) => {
      const port = new SerialPort(path, options);

      const parser = port.pipe(
        new Delimiter({ delimiter: [BidibSerialLink.BIDIB_PKT_MAGIC] })
      );

      port.on('open', function () {
        port.update(options);

        console.log('[SYS] port open', port.isOpen, 'baudrate', port.baudRate);

        if (port.isOpen) {
          serialport = port;
          serialparser = parser;
          resolve({ port, parser });
        } else {
          reject('[SYS] Some reason to reject serial connection.....???');
        }
      });
    }
  );
}

export function getSerialPort() {
  return serialport;
}

export function getSerialParser() {
  return serialparser;
}

export function sendMessage(message: BidibMessage | BidibMessageType) {
  message = Array.isArray(message) ? message : [message];
  const port = getSerialPort();

  if (!port) {
    console.error('No serial port found.');
    return;
  }

  if (message.length >= 4) {
    bidibLogSentMessage(message);
  } else {
    // console.log('>>', printMessageToHex(message));
  }

  port.write(Buffer.from(message));
}

export function sendMessages(
  ...messages: Array<BidibMessage | BidibMessageType>
) {
  for (const message of messages) {
    sendMessage(message);
  }
}

let seqnum = 0x00;

export function bidibMessageWithoutData(
  addr: NodeAddress,
  msgType: BidibMessageType
) {
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

  // if (bidibSeqNumEnabled) {
  // seqnum = bidibGetAndIncrementSeqnum(seqnum);
  // console.log('seqnum', seqnum);
  // }
  message[addrSize + 1] = seqnum;
  message[addrSize + 2] = msgType;

  // Buffer message
  return message;
}

export function sendMessagesWithoutData(
  addr: NodeAddress,
  messageCodes: BidibMessageType[]
) {
  for (const messageType of messageCodes) {
    switch (messageType) {
      default:
        {
          const message = bidibMessageWithoutData(addr, messageType);
          const crc = getCRC(message);
          sendMessages(message, crc, BidibSerialLink.BIDIB_PKT_MAGIC);
        }
        break;
      case BidibSerialLink.BIDIB_PKT_MAGIC:
        sendMessage(BidibSerialLink.BIDIB_PKT_MAGIC);
        break;
    }
  }
}

export function bidibMessageWithData(
  addr: NodeAddress,
  msgType: BidibMessageType,
  data: number[]
): BidibMessage {
  // Determine message size
  let messageLength = data.length;
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
  // if (bidibSeqNumEnabled) {
  // 	seqnum = bidib_node_state_get_and_incr_send_seqnum(addr);
  // }
  message[addrSize + 1] = seqnum;
  message[addrSize + 2] = msgType;

  for (let i = 0; i < data.length; i++) {
    message[addrSize + 3 + i] = data[i];
  }

  return message;
}

export function sendMessagesWithData(
  addr: NodeAddress,
  messageTypes: BidibMessage[]
) {
  for (const [messageType, ...messageData] of messageTypes) {
    switch (messageType) {
      default:
        {
          const message = bidibMessageWithData(addr, messageType, messageData);
          const crc = getCRC(message);
          sendMessages(message, crc, BidibSerialLink.BIDIB_PKT_MAGIC);
        }
        break;
      case BidibSerialLink.BIDIB_PKT_MAGIC:
        sendMessage(BidibSerialLink.BIDIB_PKT_MAGIC);
        break;
    }
  }
}

export function bidibGetAndIncrementSeqnum(seqnum: number) {
  if (seqnum == 255) {
    seqnum = 0x01;
    return 255;
  }
  return (seqnum += 0x01);
}
