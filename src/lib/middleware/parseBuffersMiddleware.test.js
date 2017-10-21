import parseBuffersMiddleware from './parseBuffersMiddleware';

test('Should parse a buffer string that is a JSON to a JS object', () => {
  const testMessage = {
    test: 'test'
  };
  const value = Buffer.from(JSON.stringify(testMessage));
  const messageData = {
    value
  };

  const next = jest.fn();

  parseBuffersMiddleware(messageData, next);

  expect(next).toHaveBeenCalledWith({ message: testMessage });
});

test('Should parse a buffer string that is not JSON', () => {
  const testMessage = 'test';
  const value = Buffer.from(testMessage);
  const messageData = {
    value
  };

  const next = jest.fn();

  parseBuffersMiddleware(messageData, next);

  expect(next).toHaveBeenCalledWith({ message: testMessage });
});

test('Should parse a key buffer if present', () => {
  const testMessage = 'test';
  const testKey = '123';
  const value = Buffer.from(testMessage);
  const messageData = {
    value,
    key: Buffer.from(testKey)
  };

  const next = jest.fn();

  parseBuffersMiddleware(messageData, next);

  expect(next).toHaveBeenCalledWith({ key: testKey, message: testMessage });
});
