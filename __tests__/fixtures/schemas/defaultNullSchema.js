export default function defaultNullSchema(schemaName) {
  return {
    type: 'record',
    name: schemaName,
    namespace: 'com.parkhub.tests.integration',
    fields: [
      {
        name: 'name',
        type: 'string'
      },
      {
        name: 'nullValue',
        type: ['null', 'int'],
        default: null
      }
    ]
  };
}
