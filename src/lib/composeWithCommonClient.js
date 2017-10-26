import pEvent from 'p-event';
import utils from 'util';

const { promisify } = utils;

const commonProto = {
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

    const queryWatermarkOffsets = promisify(client.queryWatermarkOffsets);

    return queryWatermarkOffsets(topic, partition, timeout);
  }
};

export default function composeWithCommonClient(client) {
  return Object.assign(client, commonProto);
}
