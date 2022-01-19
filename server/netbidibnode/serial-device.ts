import SerialPort from 'serialport';
import { printMessageToHex } from '../helpers';
import { NodeAddress } from './config';
import { BIDIB_PKT_MAGIC } from './protocol';
import { bidibLogSentMessage, getCRC } from './utils';

export const Delimiter = require('@serialport/parser-delimiter');
const path = '/dev/tty.usbserial-AH05R7PP';

let serialport: SerialPort | null = null;
let parser: NodeJS.WritableStream | null = null;

const DEFAULT_SERIAL_PORT_OPTIONS = {
  baudRate: 115200,
};

export function openSerialPort(
  options: Record<string, any> = DEFAULT_SERIAL_PORT_OPTIONS
): Promise<SerialPort | null> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort(path, options);
    parser = port.pipe(new Delimiter({ delimiter: [BIDIB_PKT_MAGIC] }));

    port.on('open', function () {
      port.update(options);

      console.log('port open', port.isOpen, 'baudrate', port.baudRate);

      if (port.isOpen) {
        serialport = port;
        resolve(serialport);
      } else {
        reject(serialport);
      }
    });
  });
}

export function getSerialPort() {
  return serialport;
}

export function getSerialParser() {
  return parser;
}

export function sendMessage(message: number[] | number) {
  message = Array.isArray(message) ? message : [message];
  const port = getSerialPort();
  if (!port) {
    console.error('No serial port found.');
    return;
  }
  const messageBuffer = Buffer.from(message);
  if (message.length >= 4) {
    bidibLogSentMessage(messageBuffer);
  } else {
    console.log('>>', printMessageToHex(message));
  }
  port.write(messageBuffer);
}

export function sendMessages(...messages: Array<number[] | number>) {
  for (const message of messages) {
    sendMessage(message);
  }
}

let seqnum = 0x00;

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
  messageCodes: number[]
) {
  for (const messageType of messageCodes) {
    console.log('\n');
    switch (messageType) {
      default:
        {
          const message = bidibMessageWithoutData(addr, messageType);
          const crc = getCRC(message);
          sendMessages(message, crc, BIDIB_PKT_MAGIC);
        }
        break;
      case BIDIB_PKT_MAGIC:
        sendMessage(BIDIB_PKT_MAGIC);
        break;
    }
  }
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

export function sendMessagesWithData(
  addr: NodeAddress,
  messageCodes: Array<number[]>
) {
  for (const [messageType, ...messageData] of messageCodes) {
    console.log('\n');
    switch (messageType) {
      default:
        {
          const message = bidibMessageWithData(
            addr,
            messageType,
            messageData.length,
            messageData
          );
          const crc = getCRC(message);
          sendMessages(message, crc, BIDIB_PKT_MAGIC);
        }
        break;
      case BIDIB_PKT_MAGIC:
        sendMessage(BIDIB_PKT_MAGIC);
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
