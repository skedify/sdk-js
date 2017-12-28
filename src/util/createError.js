export default function createError(message, type, subtype) {
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
