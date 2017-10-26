import flow from 'lodash.flow';
import serializeMessage from './serializeMessage';
import getSchemaInfo from './getSchemaInfo';
import serializeToSchemaRegistryAvro from './serializeToSchemaRegistryAvro';

const prepareProduceConfiguration = flow(getSchemaInfo, serializeToSchemaRegistryAvro);

export default prepareProduceConfiguration;
