import getSchemaInfo from './getSchemaInfo';

test('Should get the schema info and return the extra configurations', () => {
  const schemaInfoSample = {
    test: 'schema'
  };
  const testTopic = 'topico';

  const cfgs = {
    registry: {
      getSchemaInfoByTopic: ({ topic }) => {
        if (topic === testTopic) {
          return schemaInfoSample;
        }

        return false;
      }
    },
    topic: testTopic,
    extraCfg: 'hello'
  };

  const result = getSchemaInfo(cfgs);

  expect(result).toEqual({
    registry: cfgs.registry,
    schemaInfo: schemaInfoSample,
    topic: testTopic,
    extraCfg: 'hello'
  });
});
