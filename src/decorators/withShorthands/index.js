import * as shorthands from './shorthands'

export function withShorthands() {
  return instance => {
    Object.defineProperties(
      instance,
      Object.keys(shorthands).reduce(
        (descriptor, key) =>
          Object.assign(descriptor, {
            [key]: {
              enumerable: true,
              configurable: false,
              writable: false,
              value: shorthands[key](instance),
            },
          }),
        {}
      )
    )
  }
}
