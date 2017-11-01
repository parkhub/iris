import kafka from 'node-rdkafka';

export default function createRDKConsumer(consumerCfgs) {
  const {
    brokerList, groupId, topicCfgs, ...otherConsumerCfgs
  } = consumerCfgs;

  const defaultCfgs = {
    'group.id': groupId,
    'metadata.broker.list': brokerList,
    'api.version.request': true
  };

  return new kafka.KafkaConsumer({ ...defaultCfgs, ...otherConsumerCfgs }, topicCfgs);
}
