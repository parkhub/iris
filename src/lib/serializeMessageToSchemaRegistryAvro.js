import debug from 'debug';

const magicByte = 0;
const log = debug('iris:serializeMessageToSchemaRegistryAvro');

export default function serializeMessageToSchemaRegistryAvro(cfgs, startingLength) {
  const { message, registry, topic } = cfgs;
  const { schemaType, schemaId } = registry.getSchemaInfoByTopic({ topic });

  const length = startingLength || 1024;
  const buf = Buffer.alloc(length);

  let pos;

  buf[0] = magicByte; // Magic byte.
  buf.writeInt32BE(schemaId, 1);

  try {
    pos = schemaType.encode(message, buf, 5); // encode message into avro
  } catch (err) {
    const paths = [];
    schemaType.isValid(message, {
      // Check message against avro schema
      errorHook(path) {
        // Track paths that cause issues
        paths.push(path.join());
      }
    });
    const validationError = {};
    validationError.type = 'VALIDATION_ERROR';
    validationError.message = 'There has been an error in encoding your message. \nCheck your Schema.\nInvalid schema paths: ';
    validationError.invalidKeys = paths;
    log(validationError);
    throw validationError;
  }

  if (pos < 0) {
    // The buffer was too short, we need to resize.
    const newStartingLength = length - pos;

    return serializeMessageToSchemaRegistryAvro(cfgs, newStartingLength);
  }

  return buf.slice(0, pos);
}
