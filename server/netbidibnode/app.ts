import { CS_NODE_ADDRESS } from './config';
import {
  BidibCsState,
  handleBidibControlStationMessage,
  sendCsState,
} from './messages/control-station';
import {
  handleBidibControlStationStartupMessage,
  sendBidibControlStationStartup,
} from './messages/system-startup';
import { getSerialParser, openSerialPort } from './serial-device';
import { bidibLogReceivedMessage } from './utils';
// import { bidibLogReceivedMessage, getBidibMessageDetails, wait } from './utils';

function onBidibUplinkMessage(message: Uint8Array) {
  // MESSAGE ::= MSG_LENGTH  MSG_ADDR  MSG_NUM  MSG_TYPE  DATA
  // MSG_LENGTH ::= 0x00 | … | 0x7f
  // MSG_ADDR ::= MSG_ADDR_STACK  0x00
  // MSG_ADDR_STACK ::= ε | NODE_ADDR  MSG_ADDR_STACK
  // NODE_ADDR ::= 0x01 | … | 0xff
  // MSG_NUM ::= 0x00 | … | 0xff
  // MSG_TYPE ::= 0x00 | … | 0xff
  // DATA ::= ε | ANY_BYTE  DATA
  // ANY_BYTE ::= 0x00 | … | 0xff

  console.log('\n');
  bidibLogReceivedMessage(message);
  handleBidibControlStationStartupMessage(message);
  handleBidibControlStationMessage(message);
}

(async function start() {
  const serialport = await openSerialPort();
  const parser = getSerialParser();

  if (!serialport || !parser) {
    console.error('Could not open serial port');
    process.exit(1);
  } else {
    serialport.on('error', function (err) {
      console.log('Error: ', err.message);
    });
    parser.on('data', (message) => {
      onBidibUplinkMessage(message);
    });

    sendBidibControlStationStartup(CS_NODE_ADDRESS);
    // await wait(500);
    // sendCsState(CS_NODE_ADDRESS, BidibCsState.BIDIB_CS_STATE_OFF);
  }
})();
