import createRegistry from './createRegistry';

const schemasByTopicMapFixture = () => ({
  schemasByTopicMap: {
    test: {
      topico: 'topic'
    }
  }
});

test('Should create a registry instance', () => {
  const registry = createRegistry(schemasByTopicMapFixture());

  expect(typeof registry.getSchemaInfoByTopic).toBe('function');
});

test('Should get schema information by topic', () => {
  const registry = createRegistry(schemasByTopicMapFixture());

  const topicInfo = registry.getSchemaInfoByTopic({ topic: 'test' });

  expect(topicInfo).toEqual({
    topico: 'topic'
  });
});
