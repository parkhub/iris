import debug from 'debug';
import request from 'request-promise-native';

const schemaRegistryUrl = 'http://schema-registry:8081';
const log = debug('test:integration:waitForServicesToBeAvailable');

const postOpts = {
  method: 'get',
  url: `${schemaRegistryUrl}/subjects`,
  timeout: 5000
};

export default async function waitForServicesToBeAvailable(tries = 0) {
  try {
    log(`Making request ${tries}`);

    await request(postOpts);
  } catch (e) {
    log('Failed...');

    if (tries === 5) {
      throw new Error(e);
    }

    const newTries = tries + 1;

    waitForServicesToBeAvailable(newTries);
  }
}
