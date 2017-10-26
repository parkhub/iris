import fetchSchemaByTopicAndVersion from './fetchSchemaByTopicAndVersion';

export default function fetchConfiguredSchemas({ registryUrl, schemaCfgs }) {
  return Promise.all(schemaCfgs.map(cfg => fetchSchemaByTopicAndVersion({ registryUrl, ...cfg })));
}
