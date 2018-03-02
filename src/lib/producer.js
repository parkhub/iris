import flow from 'lodash.flow';
import createIrisProducer from './createIrisProducer';
import createRDKProducer from './createRDKProducer';
import promisifyCommonMethods from './promisifyCommonMethods';

export default function producer(cfgs) {
  const { producerCfgs, registry } = cfgs;

  const irisFactory = createIrisProducer(registry);

  //flow passes producerCfgs as params into createRDKProducer,
  //then the result of that into promisifyCommonMethods,
  //thenthe result of that into irisFactor,
  //then returns the result of that.
  return flow(createRDKProducer, promisifyCommonMethods, irisFactory)(producerCfgs);
}
