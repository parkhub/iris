export default function asyncPipe(...fns) {
  return initialValue => fns.reduce(async (currVal, f) => f(await currVal), initialValue);
}
