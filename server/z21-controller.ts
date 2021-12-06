import { isSuppressedLog, matchMessageId, printPayload } from './helpers';
import { Client, getSubscribedClients } from './subscribed-clients';
import {
  messages as z21ProtocolMessages,
  subscribedClientMessages,
} from './z21-protocol';
import { replies as z21ProtocolReplies } from './z21-protocol-reply';
import { SendReplyFunction } from './z21-server';

const messageEntries = Object.entries(z21ProtocolMessages);

function findMessageID(message: Buffer) {
  for (const [id, testMessage] of messageEntries) {
    if (matchMessageId(testMessage, message)) {
      return id;
    }
  }
  return;
}

export function handleMessage(
  message: Buffer,
  client: Client,
  sendReply: SendReplyFunction
) {
  const messageId = findMessageID(message);

  if (!messageId) {
    // const dataLen = message[0];
    // const header = message[2];
    // console.group('MESSAGE DETAILS');
    // console.log('x:', `[${l.join(', ')}]`);
    // for (const [id, testMessage] of messageEntries) {
    //   if (
    //     Array.isArray(testMessage) &&
    //     testMessage[0] === dataLen &&
    //     testMessage[2] === header
    //   ) {
    //     console.log('>>', id);
    //   }
    // }
    // console.groupEnd();
    console.error(
      'Unknown message, dataLen: %s, header: %s, payload: %s',
      message[0],
      message[2],
      printPayload(message)
    );
    return;
  }
  const doLog = !isSuppressedLog(messageId);

  if (doLog) {
    console.info('Incoming message %s, %s', messageId, printPayload(message));
  }

  const replyId = `${messageId}_reply`;
  const reply = z21ProtocolReplies[replyId];

  if (reply) {
    if (doLog) {
      console.log('Outgoing message %s', replyId);
    }
    const payload = typeof reply === 'function' ? reply(message) : reply;
    if (payload.length) {
      if (Object.keys(subscribedClientMessages).includes(messageId)) {
        getSubscribedClients().forEach((client) => {
          console.log('sending %s to %s', messageId, client.address);
          sendReply(messageId, payload, client);
        });
      } else {
        console.log('sending %s to %s', messageId, client.address);
        sendReply(messageId, payload, client);
      }
    } else {
      if (doLog) {
        console.log(`// no payload for ${messageId}`);
      }
    }
  } else {
    if (doLog) {
      console.log(`no reply for ${messageId}`);
    }
  }
}

export const handleReplyAcknowlegdement: (
  error: Error | null,
  bytes: number
) => void = (error, bytes) => {
  if (error) {
    console.error(error);
  } else {
    // console.log('Reply acknowlegde!', bytes);
  }
};
