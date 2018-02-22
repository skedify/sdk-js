import { set } from '../secret'

export function withSecretData() {
  return instance => {
    // Register the instance with an empty object
    // Other decorators can set or get information using the same instance
    set(instance, {})
  }
}
