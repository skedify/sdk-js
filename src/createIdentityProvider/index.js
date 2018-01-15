import { createIdentityProviderError } from '../util/createError'
import { MISCONFIGURED, MISCONFIGURED_AUTH_PROVIDER } from '../constants'
import joinAsSpeech, { AND } from '../util/joinAsSpeech'

import Client from './identityProviders/Client'
import parse from './parseIdentityProviderString'

const IDPS = {
  client: Client,
}

export default function createIdentityProvider(idp_descriptor, network) {
  const { type, options } = parse(idp_descriptor)

  if (IDPS[type] === undefined) {
    const providers = Object.keys(IDPS).map(key => `\`${key}\``)

    throw createIdentityProviderError(
      `Identity provider \`${type}\` does not exist. The only option is ${joinAsSpeech(
        AND,
        providers
      )}.`,
      MISCONFIGURED,
      MISCONFIGURED_AUTH_PROVIDER
    )
  }

  return new IDPS[type](network, options)
}
