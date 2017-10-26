import request from 'request-promise-native';

export default function fetchSchemaByTopicAndVersion({ registryUrl, topic, version = 'latest' }) {
  const requestOpts = {
    uri: `${registryUrl}/subjects/${topic}-value/versions/${version}`,
    json: true
  };

  return request(requestOpts);
}
