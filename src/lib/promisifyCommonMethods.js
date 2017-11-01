import utils from 'util';

const { promisify } = utils;

export default function promisifyCommonMethods(client) {
  const originalGetMetadata = client.getMetadata.bind(client);
  const getMetadata = promisify(originalGetMetadata).bind(client);
  // const originalQueryWatermarkOffsets = client.queryWatermarkOffsets.bind(client);
  // const queryWatermarkOffsets = promisify(originalQueryWatermarkOffsets).bind(client);
  const originalConnect = client.connect.bind(client);
  const connect = promisify(originalConnect).bind(client);
  const originalDisconnect = promisify(client.disconnect).bind(client);
  const disconnect = promisify(client.disconnect).bind(client);

  // eslint-disable-next-line no-param-reassign
  client.getMetadata = (opts = {}, cb) => {
    if (cb) {
      return originalGetMetadata(opts, cb);
    }

    return getMetadata(opts);
  };

  // TODO This throws an unknown function error on node-rdkafka, look into it
  // eslint-disable-next-line no-param-reassign
  // client.queryWatermarkOffsets = (topic, partition, timeout, cb) => {
  //   if (cb) {
  //     return originalQueryWatermarkOffsets(topic, partition, timeout, cb);
  //   }
  //
  //   return queryWatermarkOffsets(topic, partition, timeout);
  // };

  // eslint-disable-next-line no-param-reassign
  client.connect = (metaOpts = {}, cb) => {
    if (cb) {
      return originalConnect(metaOpts, cb);
    }

    return connect(metaOpts);
  };

  // eslint-disable-next-line no-param-reassign
  client.disconnect = (cb) => {
    if (cb) {
      return originalDisconnect(cb);
    }

    return disconnect();
  };

  return client;
}
