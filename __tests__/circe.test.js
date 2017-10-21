import circe from '../src';

jest.setTimeout(60000);
jest.unmock('node-rdkafka');
jest.unmock('@parkhub/circe-middleware');

const runningClients = [];

afterAll(async () => {
  await Promise.all(runningClients.map(client => client.disconnect()));
});

test('Should produce and consume an object message', async (done) => {
  expect.assertions(3);

  const topic = 'SIMPLE_TEST_TOPIC';
  const testKey = 'test_key';
  const connection = 'kafka:9092';
  const groupId = 'integration-consumer-test';
  const testMessage = {
    test: 'message'
  };

  const consumer = await circe.createConsumer({
    connection,
    groupId
  });

  runningClients.push(consumer);
  const producer = await circe.createProducer({
    connection
  });

  runningClients.push(producer);

  consumer.subscribe({ topic });
  const middleware = jest.fn((value, next) => {
    next(value);
  });

  const middlewareProducer = jest.fn((value, next) => {
    next(value);
  });

  const handler = (data) => {
    expect(middleware).toHaveBeenCalledTimes(1);
    expect(middlewareProducer).toHaveBeenCalledTimes(1);
    expect(data).toMatchObject({
      topic,
      key: testKey,
      message: testMessage
    });

    done();
  };

  consumer.consume({ handler, middleware: [middleware] });

  producer.publish({
    publishCfgs: {
      topic,
      key: testKey,
      message: testMessage
    },
    middleware: [middlewareProducer]
  });
});

test('Should produce and consume a string message', async (done) => {
  expect.assertions(1);

  const topic = 'SIMPLE_TEST_TOPIC_STRING';
  const testKey = 'test_key';
  const connection = 'kafka:9092';
  const groupId = 'integration-string-consumer-test';
  const testMessage = 'test';

  const consumer = await circe.createConsumer({
    connection,
    groupId
  });

  runningClients.push(consumer);
  const producer = await circe.createProducer({
    connection
  });

  runningClients.push(producer);

  const handler = (data) => {
    expect(data).toMatchObject({
      topic,
      key: testKey,
      message: testMessage
    });

    done();
  };

  consumer.subscribe({ topic });
  consumer.consume({ handler });

  producer.publish({
    publishCfgs: {
      topic,
      key: testKey,
      message: testMessage
    }
  });
});
