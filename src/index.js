/* @flow */

/**
 *
 * @module @parkhub/iris
 * @author Daniel Olivares
 */

import debug from 'debug';
import schemaRegistry from './lib/schemaRegistry';
import producer from './lib/producer';
import consumer from './lib/consumer';

type IrisConfigs = {
  registryUrl: string,
  brokerList: string,
  schemaCfgs: Object
};

const log = debug('iris');

const irisProto = {
  async initialize() {
    log('Initializing schema registry...');
    const { schemaCfgs, registryUrl } = this;

    this.registry = await schemaRegistry({ schemaCfgs, registryUrl });
    log('Schema registry initialized');

    return this;
  },
  async createProducer(cfgs) {
    const { brokerList, registry } = this;
    const producerCfgs = {
      brokerList,
      ...cfgs
    };

    log('Creating new producer with configurations %O', producerCfgs);

    const initiatedProducer = await producer({
      producerCfgs,
      registry
    });

    log('Created producer');

    this.instantiatedProducers.push(initiatedProducer);

    return initiatedProducer;
  },
  async createConsumer(cfgs) {
    const { brokerList, registry } = this;
    const consumerCfgs = {
      brokerList,
      ...cfgs
    };

    log('Creating new consumer with configurations %O', consumerCfgs);

    const initiatedConsumer = await consumer({
      consumerCfgs,
      registry
    });

    log('Created new consumer');

    this.instantiatedConsumers.push(initiatedConsumer);

    return initiatedConsumer;
  },
  disconnectAllClients() {
    const producers = this.instantiatedProducers;
    const consumers = this.instantiatedConsumers;

    log('Disconnecting %d producers and %d consumers', producers.length, consumers.length);

    return Promise.all([...producers, ...consumers].map(client => client.disconnect()));
  }
};

export default function iris({ registryUrl, brokerList, schemaCfgs }: IrisConfigs) {
  log(
    `Creating new iris instance with { registryUrl: ${registryUrl}, brokerList: ${brokerList}, schemaCfgs: %O`,
    schemaCfgs
  );

  return Object.assign(Object.create(irisProto), {
    instantiatedProducers: [],
    instantiatedConsumers: [],
    schemaCfgs,
    registryUrl,
    brokerList
  });
}
