export default function jsonReviver(key, value) {
  if (key === 'schema') {
    return JSON.parse(value);
  }

  return value;
}
