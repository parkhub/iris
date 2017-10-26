const magicByte = 0;

export default function serializeToSchemaRegistryAvro(cfgs, startingLength) {
  const { message, registry, ...otherCfgs } = cfgs;
  const { topic } = otherCfgs;
  const { schemaType, schemaId } = registry.getSchemaInfoByTopic({ topic });

  const length = startingLength || 1024;
  const buf = Buffer.alloc(length);

  buf[0] = magicByte; // Magic byte.
  buf.writeInt32BE(schemaId, 1);

  const pos = schemaType.encode(message, buf, 5);

  if (pos < 0) {
    // The buffer was too short, we need to resize.
    const newStartingLength = length - pos;

    return serializeToSchemaRegistryAvro(cfgs, newStartingLength);
  }

  const srAvroBuffer = buf.slice(0, pos);

  return {
    message: srAvroBuffer,
    ...otherCfgs
  };
}
