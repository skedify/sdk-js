import createAcceptLanguageHeader from './createAcceptLanguageHeader'
import { get } from '../../secret'

function createDefaultHeaderInstaller(instance, config) {
  const { headers = {} } = config
  return function installDefaultHeaders({ locale }) {
    const { network } = get(instance)

    // Set default headers
    Object.assign(network.defaults.headers.common, headers)

    network.defaults.headers.common[
      'Accept-Language'
    ] = createAcceptLanguageHeader(locale)
  }
}

export function withDefaults(config) {
  return instance => {
    const installDefaultHeaders = createDefaultHeaderInstaller(instance, config)
    installDefaultHeaders(instance.configuration)

    // Listen when configuration changes occur
    instance.onConfigurationChange(installDefaultHeaders)
  }
}
