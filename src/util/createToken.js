import { v4 as uuid } from 'uuid'

export default function createToken() {
  return uuid().replace(/-/g, '')
}
