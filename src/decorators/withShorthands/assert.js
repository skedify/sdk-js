import { createResourceError } from '../../util/createError'
import {
  ERROR_RESOURCE,
  ERROR_RESOURCE_MISSING_ARGUMENT,
} from '../../constants'
import joinAsSpeech, { AND } from '../../util/joinAsSpeech'

export default function assert(call, given, required = Object.keys(given)) {
  const missing = required
    .filter(key => given[key] === undefined)
    .map(key => `\`${key}\``)

  const actualGiven = Object.keys(given)
    .filter(key => given[key] !== undefined)
    .reduce((res, key) => Object.assign(res, { [key]: given[key] }), {})

  if (missing.length > 0) {
    throw createResourceError(
      `You tried to call .${call}(${JSON.stringify(
        actualGiven
      )}) but ${joinAsSpeech(AND, missing)} ${
        missing.length === 1 ? 'is' : 'are'
      }${Object.keys(actualGiven).length > 0 ? ' also' : ''} required.`,
      ERROR_RESOURCE,
      ERROR_RESOURCE_MISSING_ARGUMENT
    )
  }
}
