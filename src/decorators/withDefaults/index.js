import createAcceptLanguageHeader from './createAcceptLanguageHeader'
import { get } from '../../secret'

function createDefaultHeaderInstaller(instance) {
  return function installDefaultHeaders({ locale }) {
    const { network } = get(instance)
    network.defaults.headers.common[
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
