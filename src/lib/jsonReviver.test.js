import jsonReviver from './jsonReviver';

test('Should parse a json string from schema key', () => {
  const schemaObj = {
    hello: 'hi'
  };

  const parsedObj = JSON.parse(
    JSON.stringify({
      schema: JSON.stringify(schemaObj),
      otherKey: 2
    }),
    jsonReviver
  );

  expect(parsedObj).toEqual({
    schema: schemaObj,
    otherKey: 2
  });
});
