import createRDKProducer from './createRDKProducer';

test('Should create a new producer instance and pass along the client and registry', () => {
  const cfgs = {
    brokerList: 'testurl:8080'
  };

  const client = createRDKProducer(cfgs);

  expect(typeof client.connect).toBe('function');
  expect(typeof client.produce).toBe('function');
  expect(typeof client.on).toBe('function');
});
