export default function getSchemaInfo(produceCfgs) {
  const { registry, ...otherCfgs } = produceCfgs;
  const { topic } = otherCfgs;

  return {
    schemaInfo: registry.getSchemaInfoByTopic({ topic }),
    registry,
    ...otherCfgs
  };
}
