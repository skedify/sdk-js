import encodeString from './encodeString'
import encodeArray from './encodeArray'
import encodeObject from './encodeObject'

export default function encode(thing, name) {
  if (Array.isArray(thing)) {
    return encodeArray(thing, name)
  } else if (
    Function.prototype.isPrototypeOf(thing.toString) &&
    typeof thing === 'object' && // eslint-disable-line better/no-typeofs
    Object.getPrototypeOf(thing) !== Object.prototype
  ) {
    return encodeString(thing.toString(), name)
  } else if (Object.prototype.isPrototypeOf(thing)) {
    return encodeObject(thing, name)
  }
  return encodeString(`${thing}`, name)
}
