import uuid from 'uuid'

export default function createToken() {
  return uuid().replace(/-/g, '')
}
