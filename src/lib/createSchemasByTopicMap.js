import avro from 'avsc';

export default function createSchemasByTopicMap(rawSchemas) {
  const schemasByTopicMap = rawSchemas.reduce((map, rawSchema) => {
    const {
      schema, id, version, subject
    } = rawSchema;
    const [topic] = subject.split('-');
    const schemaType = avro.Type.forSchema(schema, { wrapUnions: true });

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
