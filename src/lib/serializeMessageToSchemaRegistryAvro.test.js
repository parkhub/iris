import avro from 'avsc';
import serializeMessageToSchemaRegistryAvro from './serializeMessageToSchemaRegistryAvro';

const schemaFixture = () =>
  avro.Type.forSchema(
    {
      type: 'record',
      name: 'testSchema',
      namespace: 'test.schema',
      fields: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'int',
          type: 'int'
        }
      ]
    },
    { wrapUnions: true }
  );

const registryFixture = () => ({
  getSchemaInfoByTopic() {
    return {
      schemaType: schemaFixture(),
      schemaId: 1
    };
  }
});

test('Should serialize to schema registry valid avro', () => {
  const registry = registryFixture();
  const avroType = schemaFixture();

  const message = {
    name: 'test',
    int: 1
  };

  const serializedMessage = serializeMessageToSchemaRegistryAvro({
    message,
    registry,
    topic: 'test'
  });

  const schemaId = serializedMessage.readInt32BE(1);
  const decodedMessage = avroType.decode(serializedMessage, 5).value;

  expect(schemaId).toBe(1);
  expect(decodedMessage).toEqual(message);
});

test('Should serialize a big message to schema registry valid avro', () => {
  const registry = registryFixture();
  const avroType = schemaFixture();

  const message = {
    name: Array(10000)
      .fill('0')
      .join(),
    int: 550
  };

  const serializedMessage = serializeMessageToSchemaRegistryAvro({
    message,
    registry,
    topic: 'test'
  });

  const schemaId = serializedMessage.readInt32BE(1);
  const decodedMessage = avroType.decode(serializedMessage, 5).value;

  expect(schemaId).toBe(1);
  expect(decodedMessage).toEqual(message);
});
