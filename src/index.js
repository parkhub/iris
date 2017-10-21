/**
 *
 * @module @parkhub/iris
 * @author Daniel Olivares
 */

import schemaRegistry from './lib/schemaRegistry';

/* TODOS
 * TODO UPDATE DOCS
 * TODO Define what a producerCfG looks like
 * TODO Improve DOCS by adding examples etc
*/

const irisProto = {
  initialize() {
    return this.schemaRegistry.initialize();
  }
};

export default function iris({ registryUrl, brokerUrl } = {}) {
  return Object.assign(Object.create(irisProto), {
    schemaRegistry: schemaRegistry({ registryUrl }),
    brokerUrl
  });
}
