export default function deepClone(object) {
  if (!object || !Object.prototype.isPrototypeOf(object)) {
    return object
  }
  if (Array.isArray(object)) {
    return object.map(deepClone)
  }
  return Object.keys(object).reduce(
    (clone, key) => Object.assign(clone, { [key]: deepClone(object[key]) }),
    {}
  )
}
