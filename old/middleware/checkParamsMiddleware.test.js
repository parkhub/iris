import checkParamsMiddleware from './checkParamsMiddleware';

test('Should throw if topic is not defined', () => {
  const expectedError = new Error('topic is required');
  expect(() => checkParamsMiddleware({ message: 'test' })).toThrow(expectedError);
});

test('Should throw if message is not defined', () => {
  const expectedError = new Error('message is required');
  expect(() => checkParamsMiddleware({ topic: 'test' })).toThrow(expectedError);
});

test('Should call next function with value sent in', () => {
  const params = {
    message: 'test',
    topic: 'test',
    property: 'test'
  };

  const next = jest.fn();

  checkParamsMiddleware(params, next);

  expect(next).toHaveBeenCalledWith(params);
});
