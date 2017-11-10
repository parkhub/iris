import avro from 'avsc';
import createAmbiguousUnionTypeHook from './createAmbiguousUnionTypeHook';

export default function createSchemasByTopicMap(rawSchemas) {
  const schemasByTopicMap = rawSchemas.reduce((map, rawSchema) => {
    const {
      schema, id, version, subject
    } = rawSchema;
    const [topic] = subject.split('-');
    const schemaType = avro.Type.forSchema(schema, {
      typeHook: createAmbiguousUnionTypeHook(),
      wrapUnions: true
    });

    return Object.assign({}, map, {
      [topic]: {
        schemaType,
        schemaId: id,
        schemaVersion: version,
        rawSchema: schema
      }
    });
  }, {});

  return {
    schemasByTopicMap
  };
}
