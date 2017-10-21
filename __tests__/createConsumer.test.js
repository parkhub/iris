import createConsumer from '../src/lib/createConsumer';
import createProducer from './fixtures/createProducer';

jest.setTimeout(60000);
jest.unmock('node-rdkafka');
jest.unmock('@parkhub/circe-middleware');

const runningClients = [];

afterAll(async () => {
  await Promise.all(runningClients.map(client => client.disconnect()));
});

const baseConsumer = () =>
  createConsumer({
    connection: 'kafka:9092',
    groupId: 'integration-isolated-consumer-test'
  });

test('Should disconnect a consumer', async () => {
  const consumer = await baseConsumer();

  await consumer.disconnect();

  expect(() => consumer.subscribe({ topic: 'test', handler: jest.fn() })).toThrow();
});

test('Should subscribe to an array of topics', async (done) => {
  expect.assertions(2);
  const consumer = await baseConsumer();
  const producer = await createProducer();

  runningClients.push(consumer);
  runningClients.push(producer);

  const topics = ['ARRAY_TOPIC', 'ARRAY_TOPIC_TWO'];
  const called = [];
  const handler = jest.fn((data) => {
    called.push(data.topic);

    if (called.length === 2) {
      expect(called).toContain('ARRAY_TOPIC');
      expect(called).toContain('ARRAY_TOPIC_TWO');
      expect(called).toHaveLength(2);
      expect(handler).toHaveBeenCalledTimes(2);
      done();
    }
  });

  consumer.subscribe({ topic: topics });
  consumer.consume({ handler });

  producer.produce('ARRAY_TOPIC', null, Buffer.from('test'));
  producer.produce('ARRAY_TOPIC_TWO', null, Buffer.from('test'));
});

test('Should unsubscribe a consumer', async (done) => {
  expect.assertions(1);

  const consumer = await baseConsumer();
  const producer = await createProducer();

  runningClients.push(consumer);
  runningClients.push(producer);

  const topic = 'TEST_TOPIC_UNSUBSCRIBE';
  const otherTopic = 'OTHER_TOPIC_TO_NOT_UNSUBSCRIBE';
  const testTopicHandler = jest.fn((data) => {
    expect(data.topic).toBe(otherTopic);
    done();
  });

  consumer.subscribe({ topic });
  consumer.consume({ handler: testTopicHandler });

  consumer.unsubscribe();
  consumer.subscribe({ topic: otherTopic });

  producer.produce(otherTopic, null, Buffer.from('test'));
});

test('Should add a new listener to consumer', async (done) => {
  expect.assertions(1);
  const consumer = await baseConsumer();

  const disconnectedListener = jest.fn(() => {
    expect(disconnectedListener).toHaveBeenCalledTimes(1);

    done();
  });

  consumer.addListener('disconnected', disconnectedListener);

  consumer.disconnect();
});

test('Should fail when subscribe is called without a topic', async () => {
  const consumer = await baseConsumer();

  runningClients.push(consumer);

  const expectedErr = new Error('topic is required');
  expect(() => consumer.subscribe({})).toThrow(expectedErr);
});

test('Should fail when consume is called without a handler', async () => {
  const consumer = await baseConsumer();

  runningClients.push(consumer);

  const expectedErr = new Error('handler is required');
  consumer.subscribe({ topic: 'topic' });

  expect(() => consumer.consume({})).toThrow(expectedErr);
});

test('Should throw if connection is not passed', async () => {
  const err = new Error('connection is required');
  await expect(createConsumer({ groupId: '12' })).rejects.toEqual(err);
});

test('Should throw if groupId is not passed', async () => {
  const err = new Error('groupId is required');
  await expect(createConsumer({ connection: 'test' })).rejects.toEqual(err);
});
