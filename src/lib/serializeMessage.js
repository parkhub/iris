export default function serializeMessage(produceCfgs) {
  const { message, ...otherCfgs } = produceCfgs;
  let stringifiedMessage;

  if (message !== null && typeof message === 'object') {
    stringifiedMessage = JSON.stringify(message);
  } else {
    stringifiedMessage = message;
  }

  const encodedBuffer = Buffer.from(stringifiedMessage);

  return {
    message: encodedBuffer,
    ...otherCfgs
  };
}
