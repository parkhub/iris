export default function integrationSchema(schemaName) {
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
        name: 'age',
        type: 'int'
      },
      {
        name: 'time',
        type: 'long'
      }
    ]
  };
}
