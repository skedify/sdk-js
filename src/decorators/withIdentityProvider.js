import createIdentityProvider from '../createIdentityProvider'

function install(auth_provider) {
  return {
    on(instance) {
      instance.__meta.identityProvider = createIdentityProvider(
        auth_provider,
        instance.__meta.network
      )
    },
  }
}

export function withIdentityProvider() {
  return instance => {
    // Original auth_provider
    let { auth_provider: original_auth_provider } = instance.configuration

    instance.onConfigurationChange(({ auth_provider }) => {
      if (original_auth_provider !== auth_provider) {
        install(auth_provider).on(instance)
        original_auth_provider = auth_provider
      }
    })

    install(original_auth_provider).on(instance)
  }
}
