/* @flow */

export default function timestampMiddleware(params: Object, next: Object => void): void {
  const publishParams = Object.assign({}, params);
  const { timestamp } = publishParams;

  publishParams.timestamp = timestamp || Date.now();

  return next(publishParams);
}
