import {
  handleBidibControlStationStartupMessage,
  sendBidibControlStationStartup,
} from './messages/startup';
import { BIDIB_PKT_MAGIC } from './protocol';
import { Delimiter, openSerialPort } from './serial-device';
import { bidibLogReceivedMessage, getBidibMssageDetails } from './utils';

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
}

(async function start() {
  const serialport = await openSerialPort();

  if (!serialport) {
    console.error('Could not open serial port');
    process.exit(1);
  } else {
    const parser = serialport.pipe(
      new Delimiter({ delimiter: [BIDIB_PKT_MAGIC] })
    );

    parser.on('data', onBidibUplinkMessage);

    serialport.on('error', function (err) {
      console.log('Error: ', err.message);
    });

    sendBidibControlStationStartup();
  }
})();
