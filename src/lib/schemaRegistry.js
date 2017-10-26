import asyncPipe from './asyncPipe';
import createRegistry from './createRegistry';
import createSchemasByTopicMap from './createSchemasByTopicMap';
import fetchConfiguredSchemas from './fetchConfiguredSchemas';

const schemaRegistry = asyncPipe(fetchConfiguredSchemas, createSchemasByTopicMap, createRegistry);

export default schemaRegistry;
