import createIdentityProvider from '../createIdentityProvider'
import { set } from '../secret'

function installIdentityProvider(instance, auth_provider) {
  set(instance, {
    identityProvider: createIdentityProvider(auth_provider, instance),
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
