import producer from '../src/lib/producer';
import schemaRegistry from '../src/lib/schemaRegistry';
import createSchema from './fixtures/scripts/createSchema';
import waitForServicesToBeAvailable from './fixtures/scripts/waitForServicesToBeAvailable';

const testTopic = 'ProducerIntegrationTest';
const nullTestTopic = 'ProducerNullDefaultIntegrationTest';
const registryUrl = 'http://schema-registry:8081';
const brokerList = 'kafka:9092';

let registry;

jest.setTimeout(30000);

beforeAll(async () => {
  await waitForServicesToBeAvailable();
  await createSchema(testTopic);
  await createSchema(nullTestTopic, true);

  const schemaCfgs = [
    {
      topic: testTopic
    },
    {
      topic: nullTestTopic
    }
  ];

  registry = await schemaRegistry({ schemaCfgs, registryUrl });
});

describe('Tests for producer connectivity', () => {
  let kafkaProducer;

  beforeEach(async () => {
    kafkaProducer = producer({
      producerCfgs: {
        brokerList,
        dr_cb: true,
        debug: 'all'
      },
      registry
    });
  });

  test('Should connect/disconnect using the promise interface', async () => {
    const result = await kafkaProducer.connect();

    expect(result.orig_broker_id).toBeDefined();
    expect(result.orig_broker_name).toBeDefined();
    expect(Array.isArray(result.topics)).toBe(true);

    await kafkaProducer.disconnect();

    await expect(kafkaProducer.getMetadata()).rejects.toBeDefined();
  });

  test('Should connect/disconnect using the callback interface', (done) => {
    kafkaProducer.connect({}, (err, result) => {
      expect(err).toBeNull();
      expect(result.orig_broker_id).toBeDefined();
      expect(result.orig_broker_name).toBeDefined();
      expect(Array.isArray(result.topics)).toBe(true);

      kafkaProducer.disconnect(async () => {
        await expect(kafkaProducer.getMetadata()).rejects.toBeDefined();

        done();
      });
    });
  });
});

describe('Tests while producer is connected', () => {
  let kafkaProducer;

  beforeEach(async () => {
    kafkaProducer = producer({
      producerCfgs: {
        brokerList,
        dr_cb: true,
        debug: 'all'
      },
      registry
    });

    await kafkaProducer.connect();
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

  test('Should fetch metadata(which ensures its connected) using callback', (done) => {
    kafkaProducer.getMetadata({}, (err, meta) => {
      expect(err).toBeNull();

      expect(meta.orig_broker_id).toBeDefined();
      expect(meta.orig_broker_name).toBeDefined();
      expect(Array.isArray(meta.topics)).toBe(true);

      done();
    });
  });

  test('Should produce a valid avro message', (done) => {
    const message = {
      name: 'Bruce Wayne',
      age: 25,
      time: Date.now()
    };

    const interval = setInterval(() => {
      kafkaProducer.poll();
    }, 500);

    kafkaProducer.once('delivery-report', (err, report) => {
      clearInterval(interval);

      expect(err).toBeNull();
      expect(report.topic).toBe(testTopic);
      expect(typeof report.partition).toBe('number');
      expect(typeof report.offset).toBe('number');

      done();
    });

    kafkaProducer.produce(testTopic, null, message);
  });

  test('Should produce a valid avro message with default null types', (done) => {
    const message = {
      name: 'Bruce Wayne',
      nullValue: 12345
    };

    const interval = setInterval(() => {
      kafkaProducer.poll();
    }, 500);

    kafkaProducer.once('delivery-report', (err, report) => {
      clearInterval(interval);

      expect(err).toBeNull();
      expect(report.topic).toBe(nullTestTopic);
      expect(typeof report.partition).toBe('number');
      expect(typeof report.offset).toBe('number');

      done();
    });

    kafkaProducer.produce(nullTestTopic, null, message);
  });

  test('Should throw if the message does not match the avro schema', () => {
    const message = {
      name: 'Bruce Wayne',
      age: '25',
      time: Date.now()
    };

    expect(() => kafkaProducer.produce(testTopic, null, message)).toThrow();
  });

  test.skip('Should use the promise method of queryWatermarkOffsets', async () => {});
});
