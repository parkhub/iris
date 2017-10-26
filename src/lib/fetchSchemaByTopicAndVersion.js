import request from 'request-promise-native';
import jsonReviver from './jsonReviver';

export default function fetchSchemaByTopicAndVersion({ registryUrl, topic, version = 'latest' }) {
  const requestOpts = {
    uri: `${registryUrl}/subjects/${topic}-value/versions/${version}`,
    json: true,
    jsonReviver
  };

  return request(requestOpts);
}
