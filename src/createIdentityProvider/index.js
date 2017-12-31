import createError from '../util/createError'
import { MISCONFIGURED, MISCONFIGURED_AUTH_PROVIDER } from '../constants'
import joinAsSpeech, { AND } from '../util/joinAsSpeech'

import Client from './identityProviders/Client'
import parse from './parseIdentityProviderString'

const IDPS = {
  client: Client,
}

export default function createIdentityProvider(idp_descriptor, idps = IDPS) {
  const { type, options } = parse(idp_descriptor)

  if (idps[type] === undefined) {
    const providers = Object.keys(idps).map(key => `\`${key}\``)

    throw createError(
      `Identity provider \`${type}\` does not exist. The only ${
        providers.length === 1 ? `option is` : `options are`
      } ${joinAsSpeech(AND, providers)}.`,
      MISCONFIGURED,
      MISCONFIGURED_AUTH_PROVIDER
    )
  }

  return new idps[type](options)
}
