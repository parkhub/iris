const circeInstance = {
  use: jest.fn(),
  run: jest.fn()
};
const circeMiddleware = jest.fn(() => circeInstance);

// eslint-disable-next-line no-underscore-dangle
circeMiddleware.__mock__ = circeInstance;

export default circeMiddleware;
