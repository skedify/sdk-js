import uuid from './external/uuid'

export default function createToken() {
  return uuid().replace(/-/g, '')
}
