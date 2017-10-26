import request from 'request-promise-native';
import integrationSchema from '../integrationSchema';

const topic = 'IntegrationTest';
const subjectName = `${topic}-value`;
const schemaRegistryUrl = 'http://schema-registry:8081';

const postOpts = {
  method: 'post',
  url: `${schemaRegistryUrl}/subjects/${subjectName}/versions`,
  body: {
    schema: JSON.stringify(integrationSchema())
  },
  json: true
};

export default function createSchema() {
  return request(postOpts);
}
