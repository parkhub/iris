import pEvent from 'p-event';
import debug from 'debug';

const log = debug('iris:initializeClient');

export default async function initializeClient(cfgs) {
  log('Initializing new client...');

  const { registry, client } = cfgs;

  client.connect();

  await pEvent(client, 'ready');

  log('Initialized client');

  return {
    client,
    registry
  };
}
