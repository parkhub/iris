import avro from 'avsc';
import serializeToSchemaRegistryAvro from './serializeToSchemaRegistryAvro';

const schemaFixture = () =>
  avro.Type.forSchema({
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
  });

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

  const extraCfgs = {
    topic: 'test',
    extra: 'config'
  };

  const { message: serializedMessage, ...resultingExtraCfgs } = serializeToSchemaRegistryAvro({
    message,
    registry,
    ...extraCfgs
  });

  const schemaId = serializedMessage.readInt32BE(1);
  const decodedMessage = avroType.decode(serializedMessage, 5).value;

  expect(schemaId).toBe(1);
  expect(decodedMessage).toEqual(message);
  expect(resultingExtraCfgs).toEqual(extraCfgs);
});

test('Should serialize a big message to schema registry valid avro', () => {
  const registry = registryFixture();
  const avroType = schemaFixture();

  const message = {
    name: Array(5000)
      .fill('0')
      .join(),
    int: 550
  };

  const extraCfgs = {
    extra: 'config'
  };

  const { message: serializedMessage, ...resultingExtraCfgs } = serializeToSchemaRegistryAvro({
    message,
    registry,
    ...extraCfgs
  });

  const schemaId = serializedMessage.readInt32BE(1);
  const decodedMessage = avroType.decode(serializedMessage, 5).value;

  expect(schemaId).toBe(1);
  expect(decodedMessage).toEqual(message);
  expect(resultingExtraCfgs).toEqual(extraCfgs);
});
