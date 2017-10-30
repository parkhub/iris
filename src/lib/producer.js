import asyncPipe from './asyncPipe';
import initializeClient from './initializeClient';
import createIrisProducer from './createIrisProducer';
import createRDKProducer from './createRDKProducer';
import mixinCommonMethods from './mixinCommonMethods';

export default function producer(cfgs) {
  const { producerCfgs, registry } = cfgs;

  const producer = asyncPipe(
    createRDKProducer,
    initializeClient,
    mixinCommonMethods,
    createIrisProducer(registry)
  );
}
