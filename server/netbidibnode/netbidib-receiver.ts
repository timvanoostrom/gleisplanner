import net from 'net';
import SerialPort from 'serialport';
import { hexStr, printMessageToHex } from '../helpers';
import { Client } from '../subscribed-clients';
import { BidibMessage, BidibMessageType } from './config';
import { UDs_BidibLocal } from './protocol';
import {
  bidibExtractMsgType,
  BidibMessageDetails,
  getBidibMessageDetails,
  getBidibMessageType,
  splitMessages,
} from './utils';

const NETBIDIB_PORT = 62875;
const NETBIDIB_ADDRESS = '192.168.1.100';

export let isPaired = false;

export type SendReplyFunction = (reply: number[], client: Client) => void;

let serialPortConnection: SerialPort | null = null;

let netSocket: net.Socket | null = null;
let netServer: net.Server | null = null;

let bidibCommunicationInitialized = false;

export function setPaired(paired: boolean) {
  isPaired = paired;
}

// if (isPaired) {
//   // TODO: Check which messages should be sent to the serial connection.
//   if (serialPortConnection) {
//     console.log(
//       '>> 2-SERIAL',
//       printMessageToHex(payload),
//       'msgType ' + hexStr(messageType),
//       getBidibMessageType(messageType)
//     );

//     if (!bidibCommunicationInitialized) {
//       serialPortConnection.write(
//         Buffer.from([BidibSerialLink.BIDIB_PKT_MAGIC])
//       );
//       serialPortConnection.write(
//         Buffer.from([BidibSerialLink.BIDIB_PKT_MAGIC])
//       );
//       bidibCommunicationInitialized = true;
//     }
//     serialPortConnection.write(
//       Buffer.from([BidibSerialLink.BIDIB_PKT_MAGIC])
//     );
//     serialPortConnection.write([...message, getCRC(message)]);
//   }
// } else {

function createTcpServer() {
  return new Promise<{ server: net.Server; socket: net.Socket }>(
    (resolve, reject) => {
      const server = net.createServer((socket) => {
        console.log('server!');
        if (socket) {
          resolve({ server, socket });
        } else {
          reject('some-error??');
        }
      });
      server.listen(NETBIDIB_PORT, NETBIDIB_ADDRESS);
      server.once('listening', () => {
        console.log('listttttt');
      });
    }
  );
}

// type NetMessageSend = (messageType: number) => void;
export type NetMessageHandler = (messageDetails: BidibMessageDetails) => any;
export type NetMessageHandlerCombo = [BidibMessageType, NetMessageHandler];

export function createNetMessageHandler(
  defaultHandler: NetMessageHandler,
  ...handlers: NetMessageHandlerCombo[]
) {
  const handlersByMessageType = new Map();

  for (const handlerCombo of handlers) {
    const [messageType, handler] = handlerCombo;
    handlersByMessageType.set(messageType, handler);
  }

  return function onNetMessage(message: BidibMessage) {
    const messages = splitMessages(Array.from(message));

    for (const message of messages) {
      const messageDetails = getBidibMessageDetails(message);
      const { payload, type: messageType } = messageDetails;

      console.log('\n');
      console.log(
        '<< [NET]',
        printMessageToHex(payload),
        'msgType ' + hexStr(messageType),
        UDs_BidibLocal[messageType] || getBidibMessageType(messageType)
      );

      const handler = handlersByMessageType.get(messageType) || defaultHandler;
      console.log('[SYS] handler', handler);
      handler(messageDetails);
    }
  };
}

// if (serialPort !== null) {
//   serialPortConnection = serialPort;
//   serialPort.on('data', (message) => {
//     console.log('Relaying to HOST');
//     bidibLogReceivedMessage(Array.from(message));
//     socketConnection!.write(message, (err) => {
//       if (err) {
//         console.error('Sending message from serial failed', err);
//       }
//     });
//   });
// } else {
//   console.error('Could not connect');
// }

export function netSend(message: BidibMessage | BidibMessage[]) {
  const messages = (
    !Array.isArray(message[0]) ? [message] : message
  ) as BidibMessage[];

  for (const message of messages) {
    const msgType = bidibExtractMsgType(message);
    console.log('>>', UDs_BidibLocal[msgType] || getBidibMessageType(msgType));

    if (netSocket !== null) {
      netSocket.write(Buffer.from(message));
    } else {
      console.error('Could not send, netSocket does not exist !!!!');
    }
  }
}

export async function startNetBidibServer() {
  return createTcpServer().then(({ server, socket }) => {
    netServer = server;
    netSocket = socket;

    return { server, socket };
  });
}
