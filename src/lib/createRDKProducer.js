import kafka from 'node-rdkafka';
import debug from 'debug';

const log = debug('iris:producer:createRDKProducer');

export default function createRDKProducer(producerCfgs) {
  const { brokerList, ...otherProducerCfgs } = producerCfgs;

  const defaultCfgs = {
    'metadata.broker.list': brokerList,
    'api.version.request': true
  };

  const finalProducerCfgs = {
    ...defaultCfgs,
    ...otherProducerCfgs
  };

  log('Creating new producer with %O', finalProducerCfgs);

  return new kafka.Producer(finalProducerCfgs);
}
