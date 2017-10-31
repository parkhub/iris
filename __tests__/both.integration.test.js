import waitForServicesToBeAvailable from './fixtures/scripts/waitForServicesToBeAvailable';
import createSchema from './fixtures/scripts/createSchema';
import iris from '../src';

jest.setTimeout(300000);

const testTopic = 'IntegrationTest';
const registryUrl = 'http://schema-registry:8081';
const brokerList = 'kafka:9092';

beforeAll(async () => {
  await waitForServicesToBeAvailable();
  await createSchema(testTopic);
});

describe('Running combined producer consume test', () => {
  let kafka;

  afterAll(async () => {
    await kafka.disconnectAllClients();
  });

  test('Should produce and consume a valid avro message using the schema defined', async (done) => {
    expect.assertions(3);

    const schemaCfgs = [
      {
        topic: testTopic
      }
    ];
    const message = {
      name: 'Bruce Wayne',
      age: 25,
      time: Date.now()
    };

    kafka = await iris({ registryUrl, brokerList, schemaCfgs }).initialize();

    const consumer = await kafka.createConsumer({
      groupId: 'BothIntegrationTest',
      event_cb: true
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
      const producer = await kafka.createProducer();

      await producer.connect();

      producer.produce(testTopic, null, message);
    }, 10000);
  });
});
