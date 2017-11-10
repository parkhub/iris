import debug from 'debug';
import request from 'request-promise-native';
import integrationSchema from '../schemas/integrationSchema';
import defaultNullSchema from '../schemas/defaultNullSchema';

// const topic = 'IntegrationTest';
const schemaRegistryUrl = 'http://schema-registry:8081';
const log = debug('test:integration:createSchema');

export default function createSchema(topic, isNullTest) {
  log(`Creating schema for topic ${topic}...`);

  let schemaLoader = integrationSchema;

  if (isNullTest) {
    schemaLoader = defaultNullSchema;
  }

  const subjectName = `${topic}-value`;
  const postOpts = {
    method: 'post',
    url: `${schemaRegistryUrl}/subjects/${subjectName}/versions`,
    body: {
      schema: JSON.stringify(schemaLoader(topic))
    },
    json: true
  };

  return request(postOpts);
}
