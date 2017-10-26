import kafka from 'node-rdkafka';
import circeMiddleware from '@parkhub/circe-middleware';
import createProducer from './createProducer';

jest.mock('node-rdkafka');
jest.mock('@parkhub/circe-middleware');
jest.mock('./middleware/checkParamsMiddleware');
jest.mock('./middleware/kafkaMessageToBufferMiddleware');
jest.mock('./middleware/timestampMiddleware.js');

beforeEach(() => {
  jest.clearAllMocks();
});

test('Should reject if no configs are passed in', async () => {
  await expect(createProducer()).rejects.toBeDefined();
});

test('Should reject if connection is not passed in', async () => {
  const expectedErrMsg = 'connection is required';

  await expect(createProducer({})).rejects.toEqual(new Error(expectedErrMsg));
});

test('Should create a producer with custom configurations', async () => {
  const connection = 'connection';
  const globalCfgs = {
    test: 'global'
  };

  await createProducer({ connection, globalCfgs });

  expect(circeMiddleware).toHaveBeenCalledTimes(1);
  const expectedCall = {
    'metadata.broker.list': connection,
    'broker.version.fallback': '0.10.0', // If kafka node doesn't have API, use this instead
    'api.version.request': true, // Request the api version of Kafka node
    test: 'global'
  };

  expect(kafka.Producer).toHaveBeenCalledWith(expectedCall);
});

describe('.publish', () => {
  const baseProducer = () => createProducer({ connection: 'test' });

  test('Should publish an event w/no middlewares', async () => {
    const producer = await baseProducer();

    const topic = 'test';
    const message = 'test';
    const key = 'key';
    const opaqueToken = 'token';
    const timestamp = 'timestamp';
    const partition = 'partition';

    const publishCfgs = {
      topic,
      message,
      key,
      opaqueToken,
      timestamp,
      partition
    };

    producer.publish({ publishCfgs });

    // eslint-disable-next-line no-underscore-dangle
    const middlewareInstance = circeMiddleware.__mock__;
    const runCall = middlewareInstance.run.mock.calls[0];

    expect(middlewareInstance.use).toHaveBeenCalledTimes(2);
    // Check the configs
    expect(runCall[0]).toEqual(publishCfgs);

    // Execute Fn
    runCall[1](publishCfgs);
    const produceCall = kafka.Producer.mock.instances[0].produce.mock.calls[0];

    expect(produceCall[0]).toBe(topic);
    expect(produceCall[1]).toBe(partition);
    expect(produceCall[2]).toBe(message);
    expect(produceCall[3]).toBe(key);
    expect(produceCall[4]).toBe(timestamp);
    expect(produceCall[5]).toBe(opaqueToken);
  });

  test('Should publish an event', async () => {
    const producer = await baseProducer();

    const topic = 'test';
    const message = 'test';
    const key = 'key';
    const opaqueToken = 'token';
    const timestamp = 'timestamp';
    const partition = 'partition';
    const middleware = [jest.fn()];

    const publishCfgs = {
      topic,
      message,
      key,
      opaqueToken,
      timestamp,
      partition
    };

    producer.publish({ publishCfgs, middleware });

    // eslint-disable-next-line no-underscore-dangle
    const middlewareInstance = circeMiddleware.__mock__;
    const runCall = middlewareInstance.run.mock.calls[0];

    expect(middlewareInstance.use).toHaveBeenCalledTimes(3);
    // Check the configs
    expect(runCall[0]).toEqual(publishCfgs);

    // Execute Fn
    runCall[1](publishCfgs);
    const produceCall = kafka.Producer.mock.instances[0].produce.mock.calls[0];

    expect(produceCall[0]).toBe(topic);
    expect(produceCall[1]).toBe(partition);
    expect(produceCall[2]).toBe(message);
    expect(produceCall[3]).toBe(key);
    expect(produceCall[4]).toBe(timestamp);
    expect(produceCall[5]).toBe(opaqueToken);
  });
});

describe('.disconnect()', () => {
  test('Should call disconnect from base library', async () => {
    const producerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const producer = await createProducer(producerCfgs);

    await producer.disconnect();
    expect(kafka.producerDisconnect).toHaveBeenCalledTimes(1);
  });
});

describe('.addListener', () => {
  test('Should add a listener to base library', async () => {
    const producerCfgs = {
      connection: 'kafka:123',
      groupId: 'one',
      baseLibCfg: 'test',
      topicCfgs: {
        topicCfg: 'test-topic-cfg'
      }
    };
    const producer = await createProducer(producerCfgs);

    const kafkaInstance = kafka.Producer.mock.instances[0];
    kafkaInstance.on = jest.fn();
    producer.addListener('hello', 'hi', { test: 'test' });
    expect(kafkaInstance.on).toHaveBeenCalledWith('hello', 'hi', { test: 'test' });
  });
});
