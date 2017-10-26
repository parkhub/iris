const schema = {
  type: 'record',
  name: 'IntegrationTest',
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

export default function integrationSchema() {
  return schema;
}
