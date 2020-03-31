import { set } from '../secret'

import { createDefaultLogger } from '../util/createDefaultLogger'
import { createConfigError } from '../util/createError'
import joinAsSpeech, { AND } from '../util/joinAsSpeech'
import { MISCONFIGURED, MISCONFIGURED_LOGGER } from '../constants'
import isFunction from '../util/isFunction'

const REQUIRED_METHODS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

export function withLogger() {
  return (instance) => {
    const { logger = createDefaultLogger() } = instance.configuration

    if (
      // Only do the check if we don't have the default logger
      instance.configuration.logger === logger &&
      // Validate that all required methods are available
      !REQUIRED_METHODS.every((method) => isFunction(logger[method]))
    ) {
      throw createConfigError(
        `logger should have the following methods: ${joinAsSpeech(
          AND,
          REQUIRED_METHODS.map((method) => JSON.stringify(method))
        )}`,
        MISCONFIGURED,
        MISCONFIGURED_LOGGER
      )
    }

    // Set the logger on the instance
    set(instance, { logger })
  }
}
