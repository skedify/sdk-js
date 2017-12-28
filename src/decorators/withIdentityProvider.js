import createIdentityProvider from '../createIdentityProvider'

export function withIdentityProvider() {
  return instance => {
    Object.defineProperties(instance, {
      __meta: {
        enumerable: false,
        value: Object.assign({}, instance.__meta, {
          identityProvider: createIdentityProvider(
            instance.configuration.auth_provider
          ),
        }),
      },
    })
  }
}
