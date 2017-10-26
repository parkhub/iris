export default function wrapConsumerHandler({ handler, registry }) {
  return (data) => {
    const { value: encodedMessage, topic } = data;
    const { schemaType } = registry.getSchemaInfoByTopic({ topic });

    const schemaId = encodedMessage.readInt32BE(1);
    const decodedMessage = schemaType.decode(encodedMessage, 5).value;

    handler({ message: decodedMessage, topic, schemaId });
  };
}
