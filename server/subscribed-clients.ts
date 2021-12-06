export interface Client {
  address: string;
  port: number;
  device?: string;
}

const clients: Client[] = [];

function clientIndex(client: Client) {
  return clients.findIndex((sClient) => sClient.address === client.address);
}

export function addClient(client: Client) {
  if (clientIndex(client) === -1) {
    clients.push(client);
  }
}

export function removeClient(client: Client) {
  const index = clientIndex(client);
  if (index != -1) {
    clients.splice(index, 1);
  }
}

export function isSubscribed(address: Client['address']) {
  return clientIndex({ address } as Client) !== -1;
}

export function getSubscribedClients() {
  return clients;
}
