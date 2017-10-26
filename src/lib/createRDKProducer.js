import kafka from 'node-rdkafka';

export default function createRDKProducer(cfgs) {
  const { producerCfgs: { brokerList, ...otherProducerCfgs }, ...otherCfgs } = cfgs;

  const defaultCfgs = {
    'metadata.broker.list': brokerList,
    'api.version.request': true
  };

  const rdkProducer = new kafka.Producer({ ...defaultCfgs, ...otherProducerCfgs });

  return {
    client: rdkProducer,
    ...otherCfgs
  };
}
