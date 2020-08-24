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

    // (Hopefully) prevent browsers from caching our requests
    // Previously IE11 would cache requests like /identity, this is an issue
    // because the SDK uses this call to check if the access_token is still valid (not expired)
    // E.g.: See the token grant in src\createIdentityProvider\identityProviders\index.js
    // Also see SKED-5848 & SKED-6167
    network.defaults.headers.common['Pragma'] = 'no-cache'
    network.defaults.headers.common['Cache-Control'] = 'no-store'
  }
}

export function withDefaults(config) {
  return (instance) => {
    const installDefaultHeaders = createDefaultHeaderInstaller(instance, config)
    installDefaultHeaders(instance.configuration)

    // Listen when configuration changes occur
    instance.onConfigurationChange(installDefaultHeaders)
  }
}
