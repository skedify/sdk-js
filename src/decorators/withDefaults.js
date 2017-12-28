import network from '../util/network'

import buildLanguageFallbackChain from '../util/buildLanguageFallbackChain'

function createAcceptLanguageHeader(locale) {
  return buildLanguageFallbackChain(locale)
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

export function withDefaults() {
  return instance => {
    const { locale } = instance.configuration

    network.defaults.headers.common[
      'Accept-Language'
    ] = createAcceptLanguageHeader(locale)
  }
}
