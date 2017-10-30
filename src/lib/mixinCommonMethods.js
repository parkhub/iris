import pEvent from 'p-event';
import utils from 'util';

const { promisify } = utils;

const commonProto = {
  getMetadata(cfgs) {
    const { client } = this;

    return client.getMetadata(cfgs);
  },
  listenOnce(...args) {
    const { client } = this;

    client.once(...args);
  },
  addListener(...args) {
    const { client } = this;

    client.on(...args);
  },
  disconnect() {
    const { client } = this;

    client.disconnect();

    return pEvent(client, 'disconnected');
  },
  queryOffsets(cfgs) {
    const { topic, partition, timeout } = cfgs;
    const { client } = this;

    return client.queryWatermarkOffsets(topic, partition, timeout);
  }
};

export default function composeWithCommonClient(irisClient) {
  const { client: rdkClient } = irisClient;

  rdkClient.getMetadata = promisify(rdkClient.getMetadata);
  rdkClient.queryWatermarkOffsets = promisify(rdkClient.queryWatermarkOffsets);

  return Object.assign(commonProto, irisClient);
}
