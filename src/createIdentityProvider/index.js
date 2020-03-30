import { createIdentityProviderError } from '../util/createError'
import { MISCONFIGURED, MISCONFIGURED_AUTH_PROVIDER } from '../constants'
import joinAsSpeech, { AND } from '../util/joinAsSpeech'

import parse from './parseIdentityProviderString'
import { IDPS } from './identityProviders'

export default function createIdentityProvider(idp_descriptor, instance) {
  const { type, options } = parse(idp_descriptor)

  if (IDPS[type] === undefined) {
    const providers = Object.keys(IDPS).map(key => `\`${key}\``)

    throw createIdentityProviderError(
      `Identity provider \`${type}\` does not exist.\n\nThe only options are: ${joinAsSpeech(
        AND,
        providers
      )}.`,
      MISCONFIGURED,
      MISCONFIGURED_AUTH_PROVIDER
    )
  }

  return new IDPS[type](instance, options)
}
