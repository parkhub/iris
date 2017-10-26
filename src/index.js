/* @flow */

/**
 *
 * @module @parkhub/iris
 * @author Daniel Olivares
 */

import schemaRegistry from './lib/schemaRegistry';
import producer from './lib/producer';
import consumer from './lib/consumer';

type IrisConfigs = {
  registryUrl: string,
  brokerUrl: string,
  schemaCfgs: Object
};

const irisProto = {
  async initialize() {
    const { schemaCfgs, registryUrl } = this;

    this.registry = await schemaRegistry({ schemaCfgs, registryUrl });

    return this;
  },
  async createProducer(cfgs) {
    const { brokerUrl, registry } = this;
    const producerCfgs = {
      brokerUrl,
      ...cfgs
    };

    const initiatedProducer = await producer({
      producerCfgs,
      registry
    });

    this.instantiatedProducers.push(initiatedProducer);

    return initiatedProducer;
  },
  async createConsumer(cfgs) {
    const { brokerUrl, registry } = this;
    const consumerCfgs = {
      brokerUrl,
      ...cfgs
    };

    const initiatedConsumer = await consumer({
      consumerCfgs,
      registry
    });

    this.instantiatedConsumers.push(initiatedConsumer);

    return initiatedConsumer;
  },
  disconnectAllClients() {
    const producers = this.instantiatedProducers;
    const consumers = this.instantiatedConsumers;

    return Promise.all([...producers, ...consumers].map(client => client.disconnect()));
  }
};

export default function iris({ registryUrl, brokerUrl, schemaCfgs }: IrisConfigs) {
  return Object.assign(Object.create(irisProto), {
    instantiatedProducers: [],
    instantiatedConsumers: [],
    schemaCfgs,
    registryUrl,
    brokerUrl
  });
}
