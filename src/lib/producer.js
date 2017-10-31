import flow from 'lodash.flow';
import createIrisProducer from './createIrisProducer';
import createRDKProducer from './createRDKProducer';
import promisifyCommonMethods from './promisifyCommonMethods';

export default function producer(cfgs) {
  const { producerCfgs, registry } = cfgs;

  const irisFactory = createIrisProducer(registry);

  return flow(createRDKProducer, promisifyCommonMethods, irisFactory)(producerCfgs);
}
