import schemaRegistry from '../src/lib/schemaRegistry';
import createSchema from './fixtures/scripts/createSchema';
import waitForServicesToBeAvailable from './fixtures/scripts/waitForServicesToBeAvailable';

const testTopic = 'SchemaRegistryIntegrationTest';
const registryUrl = 'http://schema-registry:8081';

jest.setTimeout(30000);

beforeAll(async () => {
  await waitForServicesToBeAvailable();
  await createSchema(testTopic);
});

test('Should load schema registry subjects from SR', async () => {
  const schemaCfgs = [
    {
      topic: testTopic
    }
  ];

  const registry = await schemaRegistry({ schemaCfgs, registryUrl });
  const schemaInfo = registry.getSchemaInfoByTopic({ topic: testTopic });

  expect(schemaInfo).toBeDefined();
});

test('Should return undefined if no schemaCfgs are configured', async () => {
  const registry = await schemaRegistry({ registryUrl });
  const schemaInfo = registry.getSchemaInfoByTopic({ topic: testTopic });

  expect(schemaInfo).not.toBeDefined();
});
