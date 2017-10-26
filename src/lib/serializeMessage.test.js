import serializeMessage from './serializeMessage';

test('Should serialize a JS object as a JSON string buffer', () => {
  const message = {
    test: 'hi',
    hello: 1
  };

  const extraCfgs = {
    other: 'config',
    anotherOne: 'config'
  };

  const { message: serializedMessage, ...otherCfgs } = serializeMessage({ message, ...extraCfgs });

  expect(JSON.parse(serializedMessage.toString())).toEqual(message);
  expect(otherCfgs).toEqual(extraCfgs);
});

test('Should serialize a string as a simple buffer', () => {
  const message = 'test string';
  const extraCfgs = {
    other: 'config',
    anotherOne: 'config'
  };

  const { message: serializedMessage, ...otherCfgs } = serializeMessage({ message, ...extraCfgs });

  expect(serializedMessage.toString()).toEqual(message);
  expect(otherCfgs).toEqual(extraCfgs);
});
