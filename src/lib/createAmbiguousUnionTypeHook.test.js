import avro from 'avsc';
import createAmbiguousUnionTypeHook from './createAmbiguousUnionTypeHook';

test('Should use the first matching type of a union', () => {
  const avroType = avro.Type.forSchema(
    {
      type: 'record',
      name: 'testSchema',
      namespace: 'test.schema',
      fields: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'nullOptional',
          type: ['null', 'int', 'float'],
          default: null
        }
      ]
    },
    { typeHook: createAmbiguousUnionTypeHook(), wrapUnions: true }
  );

  const message = {
    name: 'test name',
    nullOptional: 12345
  };

  expect(() => avroType.toBuffer(message)).not.toThrow();
});

test('Should throw if no potential union types match', () => {
  const avroType = avro.Type.forSchema(
    {
      type: 'record',
      name: 'testSchema',
      namespace: 'test.schema',
      fields: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'nullOptional',
          type: ['null', 'int'],
          default: null
        }
      ]
    },
    { typeHook: createAmbiguousUnionTypeHook(), wrapUnions: true }
  );

  const message = {
    name: 'test name',
    nullOptional: 123.1,
    nullOptionalTwo: 1511902897066
  };

  expect(() => avroType.toBuffer(message)).toThrow();
});

test('Should decode ambiguous unions by using first match', () => {
  const avroType = avro.Type.forSchema(
    {
      type: 'record',
      name: 'testSchema',
      namespace: 'test.schema',
      fields: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'nullOptional',
          type: ['null', 'float'],
          default: null
        },
        {
          name: 'nullOptionalTwo',
          type: ['null', 'long'],
          default: null
        },
        {
          name: 'nullOptionalThree',
          type: ['null', 'long'],
          default: null
        }
      ]
    },
    { typeHook: createAmbiguousUnionTypeHook(), wrapUnions: true }
  );

  const message = {
    name: 'test name',
    nullOptional: 123.1,
    nullOptionalTwo: 1511902897066,
    nullOptionalThree: 1511902897066
  };

  const buffer = avroType.toBuffer(message);
  const {
    name, nullOptional, nullOptionalTwo, nullOptionalThree
  } = avroType.fromBuffer(buffer);

  expect(name).toBe(message.name);
  // Floating points!
  expect(nullOptional).toBeCloseTo(message.nullOptional);
  expect(nullOptionalTwo).toEqual(message.nullOptionalTwo);
  expect(nullOptionalThree).toEqual(message.nullOptionalThree);
});
