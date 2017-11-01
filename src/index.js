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

type SchemaCfgs = {
  topic: string,
  version?: string
};

type IrisConfigs = {
  registryUrl: string,
  brokerList: string,
  schemaCfgs: [SchemaCfgs]
};

const log = debug('iris');

/*
  TODO: Figure out a way to actually validate messages using the schema when consuming them.
  TODO: Improve code comments and documentation
  TODO: Implement FlowJS
*/

const irisProto = {
  /**
   * Initializes the the iris instance by loading the schema registry with it's types.
   *
   * Must be called before attempting to create a producer or a consumer.
   */
  async initialize(): Promise<any> {
    log('Initializing schema registry...');
    const { schemaCfgs, registryUrl } = this;

    this.registry = await schemaRegistry({ schemaCfgs, registryUrl });
    log('Schema registry initialized');

    return this;
  },
  /**
   * Creates a new producer.
   */
  async createProducer(cfgs: { brokerList: string }): Promise<any> {
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
  /**
   * Creates a new consumer.
   */
  async createConsumer(cfgs: { brokerList: string }): Promise<any> {
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
  /**
   * Disconnect ALL clients creates by this iris instance.
   */
  disconnectAllClients(): Promise<any> {
    const producers = this.instantiatedProducers;
    const consumers = this.instantiatedConsumers;

    log('Disconnecting %d producers and %d consumers', producers.length, consumers.length);

    return Promise.all([...producers, ...consumers].map(client => client.disconnect()));
  }
};

/**
 * Factory module for iris. It creates a new instance of iris.
 */
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
