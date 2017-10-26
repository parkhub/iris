const magicByte = 0;

export default function serializeMessageToSchemaRegistryAvro(cfgs, startingLength) {
  const { message, registry, topic } = cfgs;
  const { schemaType, schemaId } = registry.getSchemaInfoByTopic({ topic });

  const length = startingLength || 1024;
  const buf = Buffer.alloc(length);

  buf[0] = magicByte; // Magic byte.
  buf.writeInt32BE(schemaId, 1);

  const pos = schemaType.encode(message, buf, 5);

  if (pos < 0) {
    // The buffer was too short, we need to resize.
    const newStartingLength = length - pos;

    return serializeMessageToSchemaRegistryAvro(cfgs, newStartingLength);
  }

  return buf.slice(0, pos);
}
