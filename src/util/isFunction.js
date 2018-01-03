export default function isFunction(obj) {
  return Boolean(obj && obj.constructor && obj.call && obj.apply)
}
