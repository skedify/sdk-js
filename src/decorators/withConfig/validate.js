import { createConfigError } from '../../util/createError'

import {
  MISCONFIGURED,
  MISCONFIGURED_AUTH_PROVIDER,
  MISCONFIGURED_LOCALE,
} from '../../constants'

export function validateLocale(input) {
  if (!input) {
    throw createConfigError(
      'locale must be configured.',
      MISCONFIGURED,
      MISCONFIGURED_LOCALE
    )
  }

  /**
   * MANDATORY - Start with 2 a-z values. E.g.: nl
   *
   * OPTIONAL:
   *  - Then have a dash. E.g.: -
   *  - Then have 2 a-z values. E.g.: be
   *  - Then have a space or dash. E.g.:  -
   *  - Then have 1, 2 or 3 a-z or numbers 0-9. E.g.: vwv
   *
   * Resulting in: `nl-be-vwv`, `nl-be` or `nl` (case insensitive)
   */
  const locales = Array.isArray(input) ? input : [input]
  if (
    locales.some(
      (locale) =>
        !/^[a-z]{2}(?:-[A-Z]{2}(?:[- ]{1}[A-Z09]{1,3})?)?$/i.test(locale)
    )
  ) {
    throw createConfigError(
      'locale is not valid.',
      MISCONFIGURED,
      MISCONFIGURED_LOCALE
    )
  }
}

export default function validate(config = {}) {
  if (!(config instanceof Object)) {
    throw createConfigError(
      `expected object but received '${config}'`,
      MISCONFIGURED
    )
  }

  validateLocale(config.locale)

  if (
    !config.hasOwnProperty('auth_provider') ||
    config.auth_provider === undefined
  ) {
    throw createConfigError(
      'auth_provider must be configured.',
      MISCONFIGURED,
      MISCONFIGURED_AUTH_PROVIDER
    )
  }

  return config
}
