import asyncPipe from './asyncPipe';
import initializeClient from './initializeClient';
import createIrisProducer from './createIrisProducer';
import createRDKProducer from './createRDKProducer';

const producer = asyncPipe(createRDKProducer, initializeClient, createIrisProducer);

export default producer;
