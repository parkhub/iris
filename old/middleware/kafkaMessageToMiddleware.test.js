import kafkaMessageToBufferMiddleware from './kafkaMessageToBufferMiddleware';

test('Should transform message property to a JSON object, if its a JS object', () => {
  const testMsg = {
    test: 'test'
  };

  const params = {
    message: testMsg
  };

  const next = jest.fn();

  kafkaMessageToBufferMiddleware(params, next);

  const { message } = next.mock.calls[0][0];

  expect(JSON.parse(message.toString())).toEqual(testMsg);
});

test('Should pass on a string', () => {
  const testMsg = 'string';

  const params = {
    message: testMsg
  };

  const next = jest.fn();

  kafkaMessageToBufferMiddleware(params, next);

  const { message } = next.mock.calls[0][0];

  expect(message.toString()).toBe(testMsg);
});
