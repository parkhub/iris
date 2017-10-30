import kafka from 'node-rdkafka';
import debug from 'debug';

const log = debug('iris:producer:createRDKProducer');

export default function createRDKProducer(cfgs) {
  const { producerCfgs: { brokerList, ...otherProducerCfgs }, ...otherCfgs } = cfgs;

  const defaultCfgs = {
    'metadata.broker.list': brokerList,
    'api.version.request': true
  };

  const producerCfgs = {
    ...defaultCfgs,
    ...otherProducerCfgs
  };

  log('Creating new producer with %O', producerCfgs);

  const rdkProducer = new kafka.Producer(producerCfgs);

  log('Successfully created producer');

  const result = {
    client: rdkProducer,
    ...otherCfgs
  };

  log('Returning %O', result);

  return result;
}
