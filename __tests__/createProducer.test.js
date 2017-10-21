import createProducer from '../src/lib/createProducer';

jest.setTimeout(60000);
jest.unmock('node-rdkafka');
jest.unmock('@parkhub/circe-middleware');

const baseProducer = () =>
  createProducer({
    connection: 'kafka:9092'
  });

test('Should throw if no argument object exists', async () => {
  expect(createProducer()).rejects.toBeDefined();
});

test('Should throw if connection is not an argument', async () => {
  expect(createProducer({})).rejects.toBeDefined();
});

test('Should add a new listener to producer', async (done) => {
  expect.assertions(1);
  const producer = await baseProducer();

  const disconnectedListener = jest.fn(() => {
    expect(disconnectedListener).toHaveBeenCalledTimes(1);

    done();
  });

  producer.addListener('disconnected', disconnectedListener);

  producer.disconnect();
});

test('Should throw if no arguments exist', async () => {
  const producer = await baseProducer();

  expect(() => producer.publish()).toThrow();
});

test('Should throw if topic is not part of publish configurations', async () => {
  const producer = await baseProducer();

  expect(() => producer.publish({ publishCfgs: { message: 'message' } })).toThrow();
});

test('Should throw if message is not part of publish configurations', async () => {
  const producer = await baseProducer();

  expect(() => producer.publish({ publishCfgs: { topic: 'message' } })).toThrow();
});
