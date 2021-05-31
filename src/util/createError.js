function createError(message, type, subtype) {
  const error = new Error(message)

  // If we want we can do something with the errors in here?
  // error.stack is available

  return Object.assign(error, {
    type,
    subtype,
    internal_stack: error.stack,

    // Rewrite the stack error so that internals aren't exposed
    stack: `Error: ${message}\n\tat <SkedifyInternals>`,
  })
}

export default Object.assign(createError, {
  withNamespace(namespace) {
    return (message, ...args) =>
      createError(`[${namespace.toUpperCase()}]: ${message}`, ...args)
  },
})

/**
 * Shorthands
 */
export const createConfigError = createError.withNamespace('config')
export const createIdentityProviderError =
  createError.withNamespace('identity provider')
export const createResourceError = createError.withNamespace('resource')
export const createResponseError = createError.withNamespace('response')
export const createRetryError = createError.withNamespace('retry')
