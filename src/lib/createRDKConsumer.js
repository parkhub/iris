import kafka from 'node-rdkafka';

export default function createRDKConsumer(cfgs) {
  const {
    consumerCfgs: {
      brokerList, groupId, topicCfgs, ...otherConsumerCfgs
    },
    ...otherCfgs
  } = cfgs;

  const defaultCfgs = {
    'group.id': groupId,
    'metadata.broker.list': brokerList,
    'api.version.request': true
  };

  const rdkConsumer = new kafka.KafkaConsumer({ ...defaultCfgs, ...otherConsumerCfgs }, topicCfgs);

  return {
    client: rdkConsumer,
    ...otherCfgs
  };
}
