import pEvent from 'p-event';

export default async function initializeClient(cfgs) {
  const { registry, client } = cfgs;

  client.connect();

  await pEvent(client, 'ready');

  return {
    client,
    registry
  };
}
