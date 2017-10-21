import iris from './';

test('Should create new instances of iris', async () => {
  const brokerUrl = 'localhost:9092';
  const registryUrl = 'localhost:8082';

  const messenger = iris({ brokerUrl, registryUrl });

  await messenger.initialize();
});

