import producer from '../src/lib/producer';
import schemaRegistry from '../src/lib/schemaRegistry';
import createSchema from './fixtures/scripts/createSchema';
import waitForServicesToBeAvailable from './fixtures/scripts/waitForServicesToBeAvailable';

const testTopic = 'ProducerIntegrationTest';
const registryUrl = 'http://schema-registry:8081';
const brokerList = 'kafka:9092';

let registry;
let kafkaProducer;

beforeAll(async () => {
  await waitForServicesToBeAvailable();
  await createSchema(testTopic);

  const schemaCfgs = [
    {
      topic: testTopic
    }
  ];

  registry = await schemaRegistry({ schemaCfgs, registryUrl });
});

beforeEach(async () => {
  kafkaProducer = await producer({
    producerCfgs: {
      brokerList: 'kafka:9092',
      dr_cb: true,
      debug: 'all'
    },
    registry
  });
});

afterEach(async () => {
  await kafkaProducer.disconnect();
});

test('Should fetch metadata(which ensures its connected)', async () => {
  const meta = await kafkaProducer.getMetadata();

  expect(meta.orig_broker_id).toBeDefined();
  expect(meta.orig_broker_name).toBeDefined();
  expect(Array.isArray(meta.topics)).toBe(true);
});

test('Should produce a valid avro message', (done) => {
  const topic = 'test';
  const message = {
    name: 'Bruce Wayne',
    age: 25,
    time: Date.now()
  };

  console.log(kafkaProducer);
  const interval = setInterval(() => {
    kafkaProducer.poll();
  }, 500);

  kafkaProducer.listenOnce('delivery-report', (err, report) => {
    clearInterval(interval);

    expect(err).not.toBeDefined();
    expect(report.topic).toBe(topic);
    expect(typeof report.partition).toBe('number');
    expect(typeof report.offset).toBe('number');

    done();
  });

  kafkaProducer.produce({
    topic: 'test',
    message
  });
});
