import request from 'request-promise-native';

const schemaRegistryUrl = 'http://schema-registry:8081';

const postOpts = {
  method: 'get',
  url: `${schemaRegistryUrl}/subjects`,
  timeout: 5000
};

export default async function waitForServicesToBeAvailable(tries = 0) {
  try {
    await request(postOpts);
  } catch (e) {
    if (tries === 5) {
      throw new Error(e);
    }

    const newTries = tries + 1;

    waitForServicesToBeAvailable(newTries);
  }
}
