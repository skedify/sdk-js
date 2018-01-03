export function applyDecorators(...decorators) {
  return instance => decorators.map(decorator => decorator(instance))
}
