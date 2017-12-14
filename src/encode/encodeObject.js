import encodeString from './encodeString'
import encode from './index'

function encodeNamedObject(obj, name) {
  return Object.keys(obj)
    .map(key => encode(obj[key], `${name}[${encodeString(key)}`))
    .join('&')
}

export default function encodeObject(obj, name) {
  if (name !== undefined) {
    return encodeNamedObject(obj, name)
  }
  return Object.keys(obj)
    .map(key => encode(obj[key], encodeString(key)))
    .join('&')
}
