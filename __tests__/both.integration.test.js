import waitForServicesToBeAvailable from './fixtures/scripts/waitForServicesToBeAvailable';
import createSchema from './fixtures/scripts/createSchema';
import iris from '../src';

jest.setTimeout(30000);

const testTopic = 'IntegrationTest';
const nullTestTopic = 'ProducerNullDefaultIntegrationTest';
const registryUrl = 'http://schema-registry:8081';
const brokerList = 'kafka:9092';

beforeAll(async () => {
  await waitForServicesToBeAvailable();
  await createSchema(testTopic);
  await createSchema(nullTestTopic, true);
});

describe('Running combined producer consume test', () => {
  let kafka;

  afterAll(async () => {
    await kafka.disconnectAllClients();
  });

  beforeAll(async () => {
    const schemaCfgs = [
      {
        topic: testTopic
      },
      {
        topic: nullTestTopic
      }
    ];

    kafka = await iris({ registryUrl, brokerList, schemaCfgs }).initialize();
  });

  test('Should produce and consume a valid avro message using the schema defined', async (done) => {
    expect.assertions(3);

    const message = {
      name: 'Bruce Wayne',
      age: 25,
      time: Date.now()
    };

    const consumer = kafka.createConsumer({
      groupId: 'BothIntegrationTest'
    });

    await consumer.connect();

    const handler = jest.fn(async (data) => {
      expect(data.message).toEqual(message);
      expect(data.topic).toBe(testTopic);
      expect(data.schemaId).toBeDefined();

      done();
    });

    consumer.subscribe([testTopic], handler);

    setTimeout(async () => {
      const producer = kafka.createProducer();
      await producer.connect();

      producer.produce(testTopic, null, message);
    }, 10000);
  });

  test('Should produce/consume a union type', async (done) => {
    expect.assertions(7);

    const message = {
      name: 'Bruce Wayne'
    };

    const consumer = kafka.createConsumer({
      groupId: 'BothIntegrationTest'
    });

    await consumer.connect();

    const handler = jest.fn(async (result) => {
      const {
        message: messageReceived, topic, size, offset, partition, key, schemaId
      } = result;

      expect(messageReceived).toEqual({
        name: 'Bruce Wayne',
        nullValue: null
      });

      expect(topic).toBe(nullTestTopic);
      expect(size).toBeDefined();
      expect(offset).toBeDefined();
      expect(partition).toBeDefined();
      expect(key).toBeDefined();
      expect(schemaId).toBeDefined();

      done();
    });

    consumer.subscribe([nullTestTopic], handler);

    setTimeout(async () => {
      const producer = kafka.createProducer();
      await producer.connect();

      producer.produce(nullTestTopic, null, message);
    }, 10000);
  });
});
