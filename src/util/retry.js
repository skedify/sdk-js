import isFunction from './isFunction'
import { createRetryError } from './createError'

import { ERROR_RETRY, ERROR_RETRY_MAX_ATTEMPTS_REACHED } from '../constants'

function delay(fn, ms) {
  return (...args) => {
    setTimeout(fn, ms, ...args)
  }
}

export default function retry(
  executor,
  { max_attempts = 3, delay_time = 1000, condition, error = undefined } = {}
) {
  if (max_attempts === 0) {
    return Promise.reject(
      Object.assign(
        createRetryError(
          error && error.message
            ? `Max retry attempts reached. (${error.message})`
            : `Max retry attempts reached.`,
          ERROR_RETRY,
          ERROR_RETRY_MAX_ATTEMPTS_REACHED
        ),
        { error }
      )
    )
  }

  return new Promise(executor).catch((actual_error) => {
    if (!isFunction(condition) || condition(actual_error)) {
      return retry(delay(executor, delay_time), {
        max_attempts: max_attempts - 1,
        delay_time,
        condition,
        error: actual_error,
      })
    }

    throw actual_error
  })
}
