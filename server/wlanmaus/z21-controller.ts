import { printMessageToHex, red } from '../helpers';
import { Client, getSubscribedClients } from '../subscribed-clients';
import { findMessageID, isSuppressedLog } from './helpers';
import { subscribedClientMessages } from './z21-protocol';
import { replies as z21ProtocolReplies } from './z21-protocol-reply';
import { SendReplyFunction } from './app';

export function handleMessage(
  message: Buffer,
  client: Client,
  sendReply: SendReplyFunction
) {
  const messageId = findMessageID(message);

  if (!messageId) {
    console.error(
      red('Unknown message, dataLen: %s, header: %s, payload: %s'),
      message[0],
      message[2],
      printMessageToHex(message)
    );
    return;
  }

  const doLog = !isSuppressedLog(messageId);

  if (doLog) {
    console.info(
      'Incoming message %s, %s',
      messageId,
      printMessageToHex(message)
    );
  }

  const replyId = `${messageId}_reply`;
  const reply = z21ProtocolReplies[replyId];

  if (reply) {
    const payload = typeof reply === 'function' ? reply(message) : reply;
    const outGoingMessageId = findMessageID(payload)!;

    if (payload.length) {
      const clients = Object.keys(subscribedClientMessages).includes(
        outGoingMessageId
      )
        ? getSubscribedClients()
        : [client];

      clients.forEach((client) => {
        if (doLog) {
          console.log(
            'Outgoing message %s to %s, %s',
            outGoingMessageId,
            client.address,
            payload
          );
        }
        sendReply(payload, client);
      });
    } else {
      if (doLog) {
        console.log(red(`// no reply payload for ${messageId}`));
      }
    }
  } else {
    if (doLog) {
      console.log(red(`no reply for ${messageId}`));
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
