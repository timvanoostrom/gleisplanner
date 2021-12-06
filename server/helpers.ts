import { suppressedProtocolIdLogs } from './config';

// export function le16(u: number) {
//   return (u[1] << 8) | u[0];
// }

// export function be16(u: number) {
//   return (u[0] << 8) | u[1];
// }

// export function be32(u: number) {
//   return (u[0] << 24) | (u[1] << 16) | (u[2] << 8) | u[3];
// }

// export function le32(u: number) {
//   return (u[3] << 24) | (u[2] << 16) | (u[1] << 8) | u[0];
// }

// export function to_le16(u: number, n2: number) {
//   u[0] = n2 & 0xff;
//   u[1] = n2 >> 8;
// }

export function matchMessageId(
  testMessage: number | Array<number | number[]>,
  message: Buffer
) {
  if (!Array.isArray(testMessage)) {
    // Match header value
    return testMessage === message[2];
  }
  return testMessage.every((char, index) => {
    const messageValue = message[index];
    // Message:     [  0x00, 0x00, 0x02, 0x00 ]
    // TestMessage: [ 0x00, 0x00, [0x00, 0x01, 0x02], 0x00 ]
    // Match oneOf several test values.
    if (Array.isArray(char)) {
      return char.some((testValue) => testValue === messageValue);
    }
    return messageValue === char;
  });
}

export function isSuppressedLog(messageId: string) {
  return suppressedProtocolIdLogs.includes(messageId);
}

export function xor(message: number[]) {
  return message.reduce((a, b) => a ^ b);
}

export function printPayload(message: Uint8Array, doPrint: boolean = false) {
  let l = [];
  for (const x of message) {
    l.push('0x' + x.toString(16).padStart(2, '0'));
  }
  const payload = `[${l.join(', ')}]`;
  if (doPrint) {
    console.log('Payload:', payload);
  }
  return payload;
}
