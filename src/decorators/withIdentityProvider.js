import createIdentityProvider from '../createIdentityProvider'
import { set, get } from '../secret'

function installIdentityProvider(instance, auth_provider) {
  const { network } = get(instance)
  set(instance, {
    identityProvider: createIdentityProvider(auth_provider, network),
  })
}

export function withIdentityProvider() {
  return instance => {
    // Original auth_provider
    let { auth_provider: original_auth_provider } = instance.configuration

    instance.onConfigurationChange(({ auth_provider }) => {
      if (original_auth_provider !== auth_provider) {
        installIdentityProvider(instance, auth_provider)
        original_auth_provider = auth_provider
      }
    })

    installIdentityProvider(instance, original_auth_provider)
  }
}
