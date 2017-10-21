const initialize = jest.fn();

const schemaRegistryMock = jest.fn(() => ({
  initialize
}));

// eslint-disable-next-line no-underscore-dangle
schemaRegistryMock.__initialize__ = initialize;

export default schemaRegistryMock;
