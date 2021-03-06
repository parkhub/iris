import consumer from '../src/lib/consumer';
import producer from '../src/lib/producer';
import schemaRegistry from '../src/lib/schemaRegistry';
import createSchema from './fixtures/scripts/createSchema';
import waitForServicesToBeAvailable from './fixtures/scripts/waitForServicesToBeAvailable';

const testTopic = 'ConsumerIntegrationTest';
const testBadAvroTopic = 'ConsumerIntegrationTestBadAvro';
const registryUrl = 'http://schema-registry:8081';
const brokerList = 'kafka:9092';

let registry;
let kafkaProducer;

jest.setTimeout(30000);

beforeAll(async () => {
  await waitForServicesToBeAvailable();
  await createSchema(testTopic);
  await createSchema(testBadAvroTopic);

  const schemaCfgs = [
    {
      topic: testTopic
    },
    {
      topic: testBadAvroTopic
    }
  ];

  registry = await schemaRegistry({ schemaCfgs, registryUrl });

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

afterAll(async () => {
  await kafkaProducer.disconnect();
});

describe('Tests while consumer is connected', () => {
  let kafkaConsumer;

  beforeEach(async () => {
    kafkaConsumer = consumer({
      consumerCfgs: {
        brokerList,
        groupId: 'CONNECTED_TESTS',
        debug: 'all'
      },
      registry
    });

    await kafkaConsumer.connect();
  });

  afterEach(async () => {
    await kafkaConsumer.disconnect();
  });

  test('Should fetch metadata(which ensures its connected)', async () => {
    const meta = await kafkaConsumer.getMetadata();

    expect(meta.orig_broker_id).toBeDefined();
    expect(meta.orig_broker_name).toBeDefined();
    expect(Array.isArray(meta.topics)).toBe(true);
  });

  test('Should return topic offsets', async () => {
    const response = await kafkaConsumer.getTopicOffsets(testTopic, 0, 5000);

    expect(response).toEqual({ highOffset: 0, lowOffset: 0 });
  });

  test('Should reject when a consumer is disconnected.', async () => {
    await kafkaConsumer.disconnect();

    await expect(kafkaConsumer.getTopicOffsets(testTopic, 0, 5000)).rejects.toBeDefined();
  });

  test('Should receive and decode a valid avro message', (done) => {
    const message = {
      name: 'Bruce Wayne',
      age: 25,
      time: Date.now()
    };

    const handler = jest.fn((data) => {
      const {
        message: resultMsg, topic, schemaId, size, offset, partition, key
      } = data;

      expect(resultMsg).toEqual(message);
      expect(topic).toBe(testTopic);
      expect(schemaId).toBeDefined();

      expect(size).toBeDefined();
      expect(offset).toBeDefined();
      expect(partition).toBeDefined();
      expect(key).toBeDefined();

      done();
    });

    kafkaConsumer.subscribe([testTopic], handler);

    setTimeout(() => {
      kafkaProducer.produce(testTopic, null, message);
    }, 10000);
  });
});

describe.skip('Bad avro tests', () => {
  let kafkaConsumer;

  beforeEach(async () => {
    kafkaConsumer = consumer({
      consumerCfgs: {
        brokerList,
        groupId: 'CONNECTED_TESTS_BAD_AVRO',
        debug: 'all'
      },
      registry
    });

    await kafkaConsumer.connect();
  });

  afterEach(async () => {
    await kafkaConsumer.disconnect();
  });

  test('Should fail if we receive a bad avro message', async (done) => {
    const message = {
      name: 1,
      time: Date.now(),
      age: '12'
    };

    // const badSchema = avro.Type.forSchema({
    //   type: 'record',
    //   name: 'ConsumerIntegration',
    //   namespace: 'test.schema',
    //   fields: [
    //     {
    //       name: 'name',
    //       type: 'int'
    //     },
    //     {
    //       name: 'age',
    //       type: 'string'
    //     },
    //     {
    //       name: 'time',
    //       type: 'long'
    //     }
    //   ]
    // });
    //
    const localProducer = producer({
      producerCfgs: {
        brokerList,
        dr_cb: true,
        debug: 'all'
      },
      registry: {
        getSchemaInfoByTopic() {
          return {
            schemaType: badSchema,
            schemaId: 2
          };
        }
      }
    });

    await localProducer.connect();

    const handler = jest.fn((result) => {
      expect(result).toContainEqual({
        message,
        topic: testBadAvroTopic,
        schemaId: 1
      });

      const {
        size, offset, partition, key
      } = result;

      expect(size).toBeDefined();
      expect(offset).toBeDefined();
      expect(partition).toBeDefined();
      expect(key).toBeDefined();

      done();
    });

    kafkaConsumer.subscribe([testBadAvroTopic], handler);

    setTimeout(() => {
      localProducer.produce(testBadAvroTopic, null, message);
    }, 10000);
  });
});
