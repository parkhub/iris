import flow from 'lodash.flow';
import createIrisConsumer from './createIrisConsumer';
import createRDKConsumer from './createRDKConsumer';
import promisifyCommonMethods from './promisifyCommonMethods';

export default function consumer(cfgs) {
  const { consumerCfgs, registry } = cfgs;

  const irisFactory = createIrisConsumer(registry);

  return flow(createRDKConsumer, promisifyCommonMethods, irisFactory)(consumerCfgs);
}
