import fetchSchemaByTopicAndVersion from './fetchSchemaByTopicAndVersion';

test('Should return a promise', () => {
  const promise = fetchSchemaByTopicAndVersion({
    registryUrl: 'http://localhost:666',
    topic: 'test',
    version: '1'
  });

  expect(typeof promise.then).toBe('function');
  expect(typeof promise.catch).toBe('function');

  // Cleaning up un handled promise rejection message
  promise.catch(() => {});
});

test('Should throw if no configuration is passed', () => {
  expect(() => fetchSchemaByTopicAndVersion()).toThrow();
});

test('Should work if empty object is passed', () => {
  const promise = fetchSchemaByTopicAndVersion({});

  expect(typeof promise.then).toBe('function');
  expect(typeof promise.catch).toBe('function');

  // Cleaning up un handled promise rejection message
  promise.catch(() => {});
});
