export const MAX_ATTEMPTS_REACHED = 'MAX_ATTEMPTS_REACHED'

function delay(fn, ms) {
  return (...args) => {
    setTimeout(() => {
      fn(...args)
    }, ms)
  }
}

export default function retry(executor, options) {
  if (options.max_attempts === 0) {
    return Promise.reject(MAX_ATTEMPTS_REACHED)
  }
  return new Promise(executor).catch(err => {
    if (
      !Function.prototype.isPrototypeOf(options.condition) ||
      options.condition(err)
    ) {
      return retry(delay(executor, 1000), {
        max_attempts: (options.max_attempts || 3) - 1,
        condition: options.condition,
      })
    }
    throw err
  })
}
