import createAcceptLanguageHeader from './createAcceptLanguageHeader'

function createDefaultHeaderInstaller(instance) {
  return function installDefaultHeaders({ locale }) {
    instance.__meta.network.defaults.headers.common[
      'Accept-Language'
    ] = createAcceptLanguageHeader(locale)
  }
}

export function withDefaults() {
  return instance => {
    const installDefaultHeaders = createDefaultHeaderInstaller(instance)
    installDefaultHeaders(instance.configuration)

    // Listen when configuration changes occur
    instance.onConfigurationChange(installDefaultHeaders)
  }
}
