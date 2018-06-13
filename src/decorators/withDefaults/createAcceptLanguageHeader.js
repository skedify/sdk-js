import buildLanguageFallbackChain from './buildLanguageFallbackChain'

export default function createAcceptLanguageHeader(locale) {
  return buildLanguageFallbackChain(locale)
    .concat('*')
    .map((lang, index, locales) => {
      if (index === 0) {
        return lang
      }

      return `${lang};q=${Math.round(
        ((locales.length - index) / locales.length) * 1000
      ) / 1000}`
    })
    .join(', ')
}
