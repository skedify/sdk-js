import { createResourceError } from '../../util/createError'
import {
  ERROR_RESOURCE,
  ERROR_RESOURCE_MISSING_ARGUMENT,
} from '../../constants'
import joinAsSpeech, { AND } from '../../util/joinAsSpeech'

export default function assert(call, given, required = Object.keys(given)) {
  const actualGivenKeys = Object.keys(given).filter(
    key => given[key] !== undefined
  )

  const actualGiven = actualGivenKeys.reduce(
    (res, key) => Object.assign(res, { [key]: given[key] }),
    {}
  )

  const missing = required
    .filter(key => !actualGivenKeys.includes(key))
    .map(key => `\`${key}\``)

  if (missing.length > 0) {
    throw createResourceError(
      `You tried to call .${call}(${JSON.stringify(
        actualGiven
      )}) but ${joinAsSpeech(AND, missing)} ${[
        missing.length === 1 ? 'is' : 'are',
        actualGivenKeys.length > 0 && 'also',
      ]
        .filter(Boolean)
        .join(' ')} required.`,
      ERROR_RESOURCE,
      ERROR_RESOURCE_MISSING_ARGUMENT
    )
  }
}
