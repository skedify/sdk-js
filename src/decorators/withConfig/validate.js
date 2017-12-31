import { createConfigError } from '../../util/createError'

import {
  MISCONFIGURED,
  MISCONFIGURED_AUTH_PROVIDER,
  MISCONFIGURED_LOCALE,
} from '../../constants'

export default function validate(config = {}) {
  if (!(config instanceof Object)) {
    throw createConfigError(
      `expected object but received '${config}'`,
      MISCONFIGURED
    )
  }

  if (!config.hasOwnProperty('locale') || config.locale === undefined) {
    throw createConfigError(
      'locale must be configured.',
      MISCONFIGURED,
      MISCONFIGURED_LOCALE
    )
  }

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
