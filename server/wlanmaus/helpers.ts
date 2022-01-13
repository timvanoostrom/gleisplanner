import { suppressedProtocolIdLogs, X_HEADER_INDEX } from './config';
import { messageEntries } from './z21-protocol';

export function getXHeader(message: Uint8Array | number[]) {
  return message[X_HEADER_INDEX];
}

export function isSuppressedLog(messageId: string) {
  return suppressedProtocolIdLogs.includes(messageId);
}

export function matchMessageId(
  testMessage: number | Array<number | number[]>,
  message: Buffer | number[]
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

export function findMessageID(message: Buffer | number[]) {
  for (const [id, testMessage] of messageEntries) {
    if (matchMessageId(testMessage, message)) {
      return id;
    }
  }
  return;
}
