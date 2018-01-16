export function withMeta() {
  return instance => {
    Object.defineProperties(instance, {
      __meta: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: Object.assign({}, instance.__meta, {}),
      },
    })
    return instance
  }
}
