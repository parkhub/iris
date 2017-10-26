import kafka from 'node-rdkafka';

export default function createRDKProducer(cfgs) {
  const { producerCfgs: { brokerUrl, ...otherProducerCfgs }, ...otherCfgs } = cfgs;

  const defaultCfgs = {
    'metadata.broker.list': brokerUrl,
    'api.version.request': true
  };

  const rdkProducer = new kafka.Producer({ ...defaultCfgs, ...otherProducerCfgs });

  return {
    client: rdkProducer,
    ...otherCfgs
  };
}
