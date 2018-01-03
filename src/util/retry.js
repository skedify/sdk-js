import isFunction from './isFunction'
import { createRetryError } from './createError'

import { ERROR_RETRY, ERROR_RETRY_MAX_ATTEMPTS_REACHED } from '../constants'

function delay(fn, ms) {
  return (...args) => {
    setTimeout(() => {
      fn(...args)
    }, ms)
  }
}

export default function retry(
  executor,
  { max_attempts = 3, delay_time = 1000, condition } = {}
) {
  if (max_attempts === 0) {
    return Promise.reject(
      createRetryError(
        'Max retry attempts reached.',
        ERROR_RETRY,
        ERROR_RETRY_MAX_ATTEMPTS_REACHED
      )
    )
  }

  return new Promise(executor).catch(error => {
    if (!isFunction(condition) || condition(error)) {
      return retry(delay(executor, delay_time), {
        max_attempts: max_attempts - 1,
        delay_time,
        condition,
      })
    }

    throw error
  })
}
