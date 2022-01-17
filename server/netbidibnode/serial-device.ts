import SerialPort from 'serialport';
import { printMessageToHex } from '../helpers';

export const Delimiter = require('@serialport/parser-delimiter');
const path = '/dev/tty.usbserial-AH05R7PP';

let serialport: SerialPort | null = null;

const DEFAULT_SERIAL_PORT_OPTIONS = {
  baudRate: 115200,
};

export function openSerialPort(
  options: Record<string, any> = DEFAULT_SERIAL_PORT_OPTIONS
): Promise<SerialPort | null> {
  return new Promise((resolve, reject) => {
    const port = new SerialPort(path, options);

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

export function sendMessage(message: number[]) {
  const port = getSerialPort();
  if (!port) {
    console.error('No serial port found.');
    return;
  }
  console.log('send.to.downlink', printMessageToHex(message));
  port.write(Buffer.from(message));
}
