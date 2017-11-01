import debug from 'debug';

const log = debug('iris:registry:createRegistry');
const instanceLog = debug('iris:registry:createRegistry:instance');

const registryProto = {
  getSchemaInfoByTopic({ topic }) {
    const { schemasByTopicMap } = this;

    instanceLog(`Getting schema info from topic ${topic}`);

    return schemasByTopicMap[topic];
  }
};

export default function createRegistry({ schemasByTopicMap }) {
  log('Creating new registry with schemas topic mac of %O', schemasByTopicMap);

  return Object.assign(Object.create(registryProto), {
    schemasByTopicMap
  });
}
