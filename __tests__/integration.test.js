import waitForServicesToBeAvailable from './fixtures/scripts/waitForServicesToBeAvailable';
import createSchema from './fixtures/scripts/createSchema';
import iris from '../src';

jest.setTimeout(600000);

beforeAll(async () => {
  await waitForServicesToBeAvailable();
  await createSchema();
});

describe('Running combined producer consume test', () => {
  let kafka;

  afterAll(async () => {
    await kafka.disconnectAllClients();
  });

  test('Should produce and consume a valid avro message using the schema defined', async (done) => {
    expect.assertions(1);

    const topic = 'IntegrationTest';
    const registryUrl = 'http://schema-registry:8081';
    const brokerList = 'kafka:9092';
    const schemaCfgs = [
      {
        topic
      }
    ];
    const message = {
      name: 'Bruce Wayne',
      age: 25,
      time: Date.now()
    };

    kafka = await iris({ registryUrl, brokerList, schemaCfgs }).initialize();

    const consumer = await kafka.createConsumer({
      groupId: 'integrationgroup',
      event_cb: true
    });

    const handler = jest.fn(async (data) => {
      expect(data).toEqual({
        message,
        topic,
        schemaId: 1
      });

      done();
    });
    consumer.subscribe({ topic: [topic], handler });

    setTimeout(async () => {
      const producer = await kafka.createProducer();

      producer.produce({ topic, message });
    }, 10000);
  });
});
