import { createIdentityProviderError } from '../util/createError'

import { MISCONFIGURED, MISCONFIGURED_AUTH_PROVIDER } from '../constants'

export default function parseIdentityProviderString(idp_descriptor = '') {
  const [type, encoded_options = ''] = idp_descriptor.split('://')

  if (type === undefined || type === '') {
    throw createIdentityProviderError(
      'You should provide a `type` as identity provider.',
      MISCONFIGURED,
      MISCONFIGURED_AUTH_PROVIDER
    )
  }

  const options = encoded_options
    .split('&')
    .map(item => item.split('='))
    .map(([key, value]) => ({
      [key]: decodeURIComponent(value),
    }))
    .reduce((a, b) => Object.assign(a, b), {})

  return { type, options }
}
