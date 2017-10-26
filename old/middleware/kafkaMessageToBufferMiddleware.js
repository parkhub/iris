/* @flow */

export default function kafkaMessageToBufferMiddleware(params: Object, next: Object => void): void {
  const publishParams = Object.assign({}, params);
  let { message } = publishParams;

  if (message !== null && typeof message === 'object') {
    message = JSON.stringify(message);
  }

  publishParams.message = Buffer.from(message);

  return next(publishParams);
}
