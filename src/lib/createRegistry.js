const registryProto = {
  getSchemaInfoByTopic({ topic }) {
    const { schemasByTopicMap } = this;

    return schemasByTopicMap[topic];
  }
};

export default function createRegistry({ schemasByTopicMap }) {
  return Object.assign(Object.create(registryProto), {
    schemasByTopicMap
  });
}
