import createSchemasMapByTopic from './createSchemasByTopicMap';

const schemaFixtures = () => [
  {
    id: 1,
    version: 1,
    subject: 'test-value',
    schema: {
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
    }
  },
  {
    id: 2,
    version: 2,
    subject: 'testtwo-value',
    schema: {
      type: 'record',
      name: 'testSchema2',
      namespace: 'test.schema2',
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
    }
  }
];

test('Should take an array of schema definitions and create a map of them', () => {
  const schemas = schemaFixtures();
  const { schemasByTopicMap } = createSchemasMapByTopic(schemas);

  expect(schemasByTopicMap.test.schemaId).toBe(1);
  expect(schemasByTopicMap.testtwo.schemaId).toBe(2);
});

test('Should not return anything if no schemas were found', () => {
  const { schemasByTopicMap } = createSchemasMapByTopic();

  expect(schemasByTopicMap).toEqual({});
});
