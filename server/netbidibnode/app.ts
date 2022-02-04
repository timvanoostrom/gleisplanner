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
  isPaired,
  NetMessageHandlerCombo,
  netSend,
  startNetBidibServer,
} from './netbidib-receiver';
import { BidibSerialLink, Us_BidibSystem } from './protocol';
import {
  bidibMessageWithData,
  openSerialPort,
  sendMessagesWithoutData,
} from './serial-device';
import { createSerialMessageHandler } from './serial-queue';
import {
  BidibMessageDetails,
  getBidibMessageDetails,
  getBidibMessageType,
  getCRC,
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
      if (isPaired) {
        const details = getBidibMessageDetails(message);

        console.log(
          'From serial',
          getBidibMessageType(details.type),
          printMessageToHex(message),
          details
        );

        const netMessage = prepareNetMessageFromSerial(details.payload);
        netSend(netMessage);
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

  const { socket: netSocket } = await startNetBidibServer();

  function pass2Serial(messageDetails: BidibMessageDetails) {
    if (isPaired) {
      sendMessagesWithoutData(CS_NODE_ADDRESS, [messageDetails.type]);
      // serialport.write(Buffer.from(messageDetails.payload));
    }
  }

  if (netSocket) {
    const handlers: NetMessageHandlerCombo[] = [
      protocolSignatureHandler,
      localLinkHandler,
      localLogonHandler,
      localLogonRejectedHandler,
    ];

    const onData = createNetMessageHandler(pass2Serial, ...handlers);
    netSocket.on('data', onData);
  }
})();
