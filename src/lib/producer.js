import asyncPipe from './asyncPipe';
import initializeClient from './initializeClient';
import createIrisProducer from './createIrisProducer';
import createRDKProducer from './createRDKProducer';
import composeWithCommonClient from './composeWithCommonClient';

const producer = asyncPipe(
  createRDKProducer,
  initializeClient,
  createIrisProducer,
  composeWithCommonClient
);

export default producer;
