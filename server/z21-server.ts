import dgram from 'dgram';
import { addClient, Client } from './subscribed-clients';
import { handleMessage, handleReplyAcknowlegdement } from './z21-controller';

const server = dgram.createSocket('udp4');
const Z21_PORT = 21105;

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

export type SendReplyFunction = (
  messageID: string,
  reply: number[],
  client: Client
) => void;

server.on('message', (message, rinfo) => {
  addClient(rinfo);
  handleMessage(message, rinfo, (messageId, reply, client) => {
    if (reply.length) {
      const replyMessage = new Uint8Array(reply);

      server.send(
        replyMessage,
        client.port,
        client.address,
        handleReplyAcknowlegdement
      );
    }
  });
});

server.on('listening', () => {
  const socket = server.address();
  console.log(`server listening ${socket.address}:${socket.port}`);
});

server.bind(Z21_PORT);
