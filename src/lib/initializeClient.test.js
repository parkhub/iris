import event from 'events';
import initializeClient from './initializeClient';

test('Should initiate a client and return it and the registry', async () => {
  const testRegistry = {
    test: 'registry'
  };

  const testClient = new event.EventEmitter();
  testClient.connect = jest.fn(function connect() {
    setTimeout(() => {
      this.emit('ready');
    }, 100);
  });

  const { client, registry } = await initializeClient({
    client: testClient,
    registry: testRegistry
  });

  expect(client.connect).toHaveBeenCalled();
  expect(registry).toEqual(testRegistry);
});
