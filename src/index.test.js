import iris from './';
import schemaRegistry from './lib/schemaRegistry';

jest.mock('./lib/schemaRegistry');

test('Should create new instances of iris and initialize it', async () => {
  const brokerUrl = 'localhost:9092';
  const registryUrl = 'localhost:8082';

  const messenger = iris({ brokerUrl, registryUrl });
  expect(schemaRegistry).toHaveBeenCalledWith({ registryUrl });

  await messenger.initialize();

  // eslint-disable-next-line no-underscore-dangle
  expect(schemaRegistry.__initialize__).toHaveBeenCalledTimes(1);
});

test('Should create a new producer', async () => {
  const brokerUrl = 'localhost:9092';
  const registryUrl = 'localhost:8082';

  const messenger = iris({ brokerUrl, registryUrl });

  await messenger.initialize();

  const producer = await messenger.createProducer();
});
