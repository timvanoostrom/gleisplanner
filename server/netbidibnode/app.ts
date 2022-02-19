import { printMessageToHex } from '../helpers';
import { BidibMessage, CS_NODE_ADDRESS } from './config';
import {
  localLinkHandler,
  localLogonHandler,
  localLogonRejectedHandler,
  protocolSignatureHandler,
} from './messages/netbidib';
import { sendBidibControlStationStartup } from './messages/system-startup';
import {
  createNetMessageHandler,
  startTcpServer,
  isPaired,
  NetMessageHandlerCombo,
  netSend,
} from './netbidib-receiver';
import { openSerialPort, sendMessagesWithoutData } from './serial-device';
import { createSerialMessageHandler } from './serial-queue';
import {
  BidibMessageDetails,
  getBidibMessageDetails,
  getBidibMessageType,
  logColor,
  prepareNetMessageFromSerial,
} from './utils';
// import { bidibLogReceivedMessage, getBidibMessageDetails, wait } from './utils';

// function onBidibUplinkMessage(message: Uint8Array) {
//   // MESSAGE ::= MSG_LENGTH  MSG_ADDR  MSG_NUM  MSG_TYPE  DATA
//   // MSG_LENGTH ::= 0x00 | … | 0x7f
//   // MSG_ADDR ::= MSG_ADDR_STACK  0x00
//   // MSG_ADDR_STACK ::= ε | NODE_ADDR  MSG_ADDR_STACK
//   // NODE_ADDR ::= 0x01 | … | 0xff
//   // MSG_NUM ::= 0x00 | … | 0xff
//   // MSG_TYPE ::= 0x00 | … | 0xff
//   // DATA ::= ε | ANY_BYTE  DATA
//   // ANY_BYTE ::= 0x00 | … | 0xff

//   console.log('\n');
//   const payload = Array.from(message);
//   bidibLogReceivedMessage(payload);
//   handleBidibControlStationStartupMessage(payload);
//   // handleBidibNodeTabMessage(message);
//   // handleBidibControlStationMessage(message);
// }

(async function start() {
  const { port: serialport, parser: serialParser } = await openSerialPort();

  if (serialport) {
    serialport.on('error', function (err) {
      console.log('Error: ', err.message);
    });

    function pass2Net(message: BidibMessage) {
      const details = getBidibMessageDetails(message);
      console.log(
        logColor('S-2-N', 'blueBright'),
        getBidibMessageType(details.type),
        printMessageToHex(message)
        // details
      );

      if (isPaired) {
        const netMessage = prepareNetMessageFromSerial(details.payload);
        netSend(netMessage);
      } else {
        console.log('not paairred??S');
      }
    }

    const onData = createSerialMessageHandler(pass2Net);

    serialParser.on('data', onData);

    sendBidibControlStationStartup(CS_NODE_ADDRESS);

    // await wait(500);
    // sendBidibNodeTabGetAll(CS_NODE_ADDRESS);
    // await wait(500);
    // sendBidibNodeTabGetNext(CS_NODE_ADDRESS, 2);
    // sendCsState(CS_NODE_ADDRESS, BidibCsState.BIDIB_CS_STATE_OFF);
  }

  function pass2Serial(messageDetails: BidibMessageDetails) {
    if (isPaired) {
      console.log(
        logColor('N-2-S', 'yellowBright'),
        getBidibMessageType(messageDetails.type),
        printMessageToHex(messageDetails.payload)
        // details
      );
      sendMessagesWithoutData(messageDetails.address, [messageDetails.type]);
      // serialport.write(Buffer.from(messageDetails.payload));
    } else {
      console.log('not paired!?');
    }
  }

  startTcpServer((socket) => {
    const handlers: NetMessageHandlerCombo[] = [
      protocolSignatureHandler,
      localLinkHandler,
      localLogonHandler,
      localLogonRejectedHandler,
    ];

    const onData = createNetMessageHandler(pass2Serial, ...handlers);
    socket.on('data', onData);
  });
})();
