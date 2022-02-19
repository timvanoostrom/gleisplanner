import { BidibMessage, BidibMessageType, NodeAddress } from './config';
import { sendMessagesWithoutData } from './serial-device';
import { bidibExtractMsgType, bidibLogReceivedMessage } from './utils';

type SerialMessageSend = (messageType: number) => void;
export type SerialMessageReceive = (message: BidibMessage) => any;
type SerialMessageTimeoutMS = number;
type QueueLineItem =
  | [
      BidibMessageType,
      SerialMessageSend,
      BidibMessageType,
      SerialMessageReceive,
      SerialMessageTimeoutMS
    ]
  | [BidibMessageType, SerialMessageSend]
  | [
      BidibMessageType,
      SerialMessageSend,
      BidibMessageType,
      SerialMessageReceive
    ];
type SerialQueue = QueueLineItem[];

const queue: SerialQueue = [
  // [1, send, 2, receive, timeout],
];
let lineItemTimeout: NodeJS.Timeout;
let queuePaused: boolean = true;
let isQueuePristine: boolean = true;

function addLineItem(lineItem: QueueLineItem) {
  queue.push(lineItem);
}

export function addLineItems(...lineItems: QueueLineItem[]) {
  for (const lineItem of lineItems) {
    addLineItem(lineItem);
  }
  return () => start();
}

export function start() {
  if (queuePaused) {
    queuePaused = false;
    nextLineItem();
  } else {
    console.log('Queue already started...');
  }
}

export function pause() {
  if (!queuePaused) {
    queuePaused = true;
  }
}

function nextLineItem() {
  if (queuePaused) {
    return;
  }

  if (!isQueuePristine && queue.length) {
    // Remove previous item from queue
    queue.shift();
  }

  if (!queue.length) {
    return;
  }

  isQueuePristine = false;

  const [
    downlinkMessageType,
    send,
    uplinkMessageTypeExpected,
    ,
    lineItemTimeoutMS = 300,
  ] = queue[0];

  if (typeof send === 'function') {
    send(downlinkMessageType);
  }

  if (lineItemTimeoutMS && uplinkMessageTypeExpected) {
    lineItemTimeout = setTimeout(() => {
      // what to do now? Sys reset or something?
      console.log(
        `Waiting for a an uplink message ${uplinkMessageTypeExpected} timed out.`
      );
    }, lineItemTimeoutMS);
  }

  // Execute next message immediately if there is no reply message expected.
  if (!uplinkMessageTypeExpected) {
    nextLineItem();
  }
}

export function receiveUnexpected(message: BidibMessage) {
  console.log('!!Unexpected!!');
  bidibLogReceivedMessage(message);
}

export function createSerialMessageHandler(
  defaultHandler: SerialMessageReceive = receiveUnexpected
) {
  return function onReply(message: Uint8Array) {
    const payload = Array.from(message);
    if (queue.length) {
      const uplinkMessageType = bidibExtractMsgType(payload);
      const [, , uplinkMessageTypeExpected, receive] = queue[0];

      if (uplinkMessageType === uplinkMessageTypeExpected) {
        if (lineItemTimeout) {
          clearTimeout(lineItemTimeout);
        }

        if (typeof receive === 'function') {
          bidibLogReceivedMessage(payload);
          // Could make this a Promise<>
          receive(payload);
        }

        nextLineItem();
      } else {
        // Could make this a Promise<>
        defaultHandler(payload);
      }
    } else {
      // Could make this a Promise<>
      defaultHandler(payload);
    }
  };
}

export function lineItemSimpleMessage(
  nodeAddress: NodeAddress,
  downlinkMessageType: BidibMessageType,
  uplinkMessageType: BidibMessageType,
  receiveMessage?: SerialMessageReceive
) {
  const receive = receiveMessage || ((message: BidibMessage) => void 0);

  const message: QueueLineItem = [
    downlinkMessageType,
    (uplinkMessageType) =>
      sendMessagesWithoutData(nodeAddress, [uplinkMessageType]),
    uplinkMessageType,
    receive,
  ];

  return message;
}

export function lineItemMessageNoReply(
  nodeAddress: NodeAddress,
  downlinkMessageType: BidibMessageType
) {
  const message: QueueLineItem = [
    downlinkMessageType,
    (uplinkMessageType) =>
      sendMessagesWithoutData(nodeAddress, [uplinkMessageType]),
  ];

  return message;
}
