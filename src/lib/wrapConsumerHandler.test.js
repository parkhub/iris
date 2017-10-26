import avro from 'avsc';
import wrapConsumerHandler from './wrapConsumerHandler';
import serializeMessageToSchemaRegistryAvro from './serializeMessageToSchemaRegistryAvro';

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

test('Should create a handler that decodes an avro encoded message before passing it down', () => {
  const registry = registryFixture();
  const topic = 'test';
  const message = {
    name: 'test',
    int: 1
  };

  const serializedMessage = serializeMessageToSchemaRegistryAvro({ message, topic, registry });
  const handler = jest.fn();

  const consumerHandler = wrapConsumerHandler({ handler, registry });

  consumerHandler({ message: serializedMessage, topic });

  expect(handler).toHaveBeenCalledWith({ message, topic, schemaId: 1 });
});
