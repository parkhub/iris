const magicByte = 0;

export default function serializeMessageToSchemaRegistryAvro(
  cfgs,
  startingLength
) {
  const { message, registry, topic } = cfgs;
  const { schemaType, schemaId } = registry.getSchemaInfoByTopic({ topic });

  const length = startingLength || 1024;
  const buf = Buffer.alloc(length);

  let pos;

  buf[0] = magicByte; // Magic byte.
  buf.writeInt32BE(schemaId, 1);

  try {
    pos = schemaType.encode(message, buf, 5); //encode message into avro
  } catch (err) {
    console.log(
      "There has been an error in encoding your message. \nCheck your Schema."
    );
    let paths = [];
    schemaType.isValid(message, {
      //Check message against schema
      errorHook: function(path) {
        //Track paths that cause issues
        paths.push(path.join());
      }
    });
    console.log("Invalid schema paths: " + paths);
  }

  if (pos < 0) {
    // The buffer was too short, we need to resize.
    const newStartingLength = length - pos;

    return serializeMessageToSchemaRegistryAvro(cfgs, newStartingLength);
  }

  return buf.slice(0, pos);
}
