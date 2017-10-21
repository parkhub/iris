import timestampMiddleware from './timestampMiddleware';

test('Should generate a timestamp if one does not exist', () => {
  const next = jest.fn();

  timestampMiddleware({}, next);

  const timestamp = next.mock.calls[0][0];

  expect(timestamp).toBeDefined();
});

test('Should use timestamp that already exists', () => {
  const next = jest.fn();
  const timestamp = 12345;

  timestampMiddleware({ timestamp }, next);

  const { timestamp: usedTimestamp } = next.mock.calls[0][0];

  expect(usedTimestamp).toBe(timestamp);
});
