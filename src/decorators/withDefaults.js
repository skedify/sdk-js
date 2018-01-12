import network from '../util/network'

import buildLanguageFallbackChain from '../util/buildLanguageFallbackChain'

function createAcceptLanguageHeader(locale) {
  return buildLanguageFallbackChain(locale)
    .concat('*')
    .map((lang, index, locales) => {
      if (index === 0) {
        return lang
      }

      return `${lang};q=${Math.round(
        (locales.length - index) / locales.length * 1000
      ) / 1000}`
    })
    .join(', ')
}

function installDefaultHeaders({ locale }) {
  network.defaults.headers.common[
    'Accept-Language'
  ] = createAcceptLanguageHeader(locale)
}

export function withDefaults() {
  return instance => {
    installDefaultHeaders(instance.configuration)

    // Listen when configuration changes occur
    instance.onConfigurationChange(installDefaultHeaders)
  }
}
