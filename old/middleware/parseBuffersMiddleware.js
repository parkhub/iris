/* @flow */

import isJSON from 'is-json';

export default function parseBuffersMiddleware(messageData: Object, next: Object => void): void {
  // Messages from Kafka are shallow objects so this "clone" is ok
  const messageLightCopy = Object.assign({}, messageData);
  const { value, key, ...restOfProperties } = messageLightCopy;
  // We expect value to be a buffer
  const stringValue = value.toString();

  const message = isJSON(stringValue) ? JSON.parse(stringValue) : stringValue;

  restOfProperties.message = message;

  if (key) {
    restOfProperties.key = key.toString();
  }

  return next(restOfProperties);
}
