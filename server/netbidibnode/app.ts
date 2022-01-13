import SerialPort from 'serialport';

const path = '/dev/tty.usbserial-AH05R7PP';

const serialport = new SerialPort(path);

serialport.on('data', function (data) {
  console.log('incoming data', data);
});
serialport.on('error', function (err) {
  console.log('Error: ', err.message);
});

export {};
