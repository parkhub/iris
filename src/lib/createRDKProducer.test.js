import createRDKProducer from './createRDKProducer';

test('Should create a new producer instance and pass along the client and registry', () => {
  const registry = {
    test: 'registry'
  };

  const cfgs = {
    producerCfgs: {
      brokerList: 'testurl:8080'
    },
    registry
  };

  const { client, registry: resultRegistry } = createRDKProducer(cfgs);

  expect(typeof client.connect).toBe('function');
  expect(typeof client.produce).toBe('function');
  expect(typeof client.on).toBe('function');
  expect(resultRegistry).toEqual(registry);
});
