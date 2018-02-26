import isFunction from './util/isFunction'

const instances = new WeakMap()

export function set(key, data) {
  const resolver = isFunction(data) ? data : () => data

  if (instances.has(key)) {
    const original = instances.get(key)

    instances.set(key, Object.assign({}, original, resolver(original)))
  } else {
    instances.set(key, resolver())
  }
}

export function get(key) {
  return instances.get(key)
}
