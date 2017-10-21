import kafka from 'node-rdkafka';
import circeMiddleware from '@parkhub/circe-middleware';
import createConsumer from './createConsumer';

jest.mock('node-rdkafka');
jest.mock('@parkhub/circe-middleware');
jest.mock('./middleware/parseBuffersMiddleware');

beforeEach(() => {
  jest.clearAllMocks();
});

const baseConsumer = () =>
  createConsumer({
    connection: 'kafka',
    groupId: 'test'
  });

test('Should throw if connection is not passed', async () => {
  const err = new Error('connection is required');
  await expect(createConsumer({ groupId: '12' })).rejects.toEqual(err);
});

test('Should throw if groupId is not passed', async () => {
  const err = new Error('groupId is required');
  await expect(createConsumer({ connection: 'test' })).rejects.toEqual(err);
});

describe('.subscribe', () => {
  test('Should throw if topic is not a parameter', async () => {
    const consumer = await baseConsumer();
    const expectedError = new Error('topic is required');

    expect(() => consumer.subscribe({ handler: jest.fn() })).toThrow(expectedError);
  });

  test('Should accept an single topic and convert it to an array', async () => {
    const consumer = await baseConsumer();
    const topic = 'test';
    consumer.subscribe({ topic, handler: jest.fn() });

    const kafkaInstance = kafka.KafkaConsumer.mock.instances[0];

    expect(kafkaInstance.subscribe).toHaveBeenCalledWith([topic]);
  });

  test('Should subscribe to topic, setup middleware and trigger handler', async () => {
    const topics = ['TEST', 'TEST_TWO'];
    const handler = jest.fn();

    const consumer = await baseConsumer();
    const ware = jest.fn();

    consumer.subscribe({ topic: topics });
    consumer.consume({ handler, middleware: [ware] });

    const kafkaInstance = kafka.KafkaConsumer.mock.instances[0];

    // eslint-disable-next-line no-underscore-dangle
    const circeInstance = circeMiddleware.__mock__;

    expect(circeMiddleware).toHaveBeenCalledTimes(1);
    expect(circeInstance.use).toHaveBeenCalledTimes(1);
    expect(kafkaInstance.subscribe).toHaveBeenCalledWith(topics);
    expect(kafkaInstance.consume).toHaveBeenCalledTimes(1);

    kafkaInstance.triggerTopic();

    expect(circeInstance.run).toHaveBeenCalledTimes(1);
  });
});

describe('.consume()', () => {
  test('Should throw if handler is not a parameter', async () => {
    const consumer = await baseConsumer();
    const expectedError = new Error('handler is required');
    consumer.subscribe({ topic: 'test' });

    expect(() => consumer.consume({})).toThrow(expectedError);
  });
});
describe('.disconnect()', () => {
  test('Should call disconnect from consumer', async () => {
    const consumer = await baseConsumer();

    await consumer.disconnect();
    expect(kafka.consumerDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('.unsubscribe()', () => {
  test('Should call unsubscribe from consumer', async () => {
    const consumer = await baseConsumer();

    consumer.unsubscribe();
    expect(kafka.unsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe('.addListener', () => {
  test('Should add a listener to consumer', async () => {
    const consumer = await baseConsumer();

    const handler = jest.fn();
    const kafkaInstance = kafka.KafkaConsumer.mock.instances[0];
    kafkaInstance.on = jest.fn();

    consumer.addListener('hello', handler);
    expect(kafkaInstance.on).toHaveBeenCalledWith('hello', handler);
  });
});
