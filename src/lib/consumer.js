import asyncPipe from './asyncPipe';
import initializeClient from './initializeClient';
import createIrisConsumer from './createIrisConsumer';
import createRDKConsumer from './createRDKConsumer';
import composeWithCommonClient from './composeWithCommonClient';

const consumer = asyncPipe(
  createRDKConsumer,
  initializeClient,
  createIrisConsumer,
  composeWithCommonClient
);

export default consumer;
