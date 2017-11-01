import debug from 'debug';
import request from 'request-promise-native';
import integrationSchema from '../integrationSchema';

// const topic = 'IntegrationTest';
const schemaRegistryUrl = 'http://schema-registry:8081';
const log = debug('test:integration:createSchema');

export default function createSchema(topic) {
  log(`Creating schema for topic ${topic}...`);

  const subjectName = `${topic}-value`;
  const postOpts = {
    method: 'post',
    url: `${schemaRegistryUrl}/subjects/${subjectName}/versions`,
    body: {
      schema: JSON.stringify(integrationSchema(topic))
    },
    json: true
  };

  return request(postOpts);
}
