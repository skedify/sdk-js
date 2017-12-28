function buildChain(language, chain = [language]) {
  if (language.indexOf('-') === -1) {
    return chain
  }

  const fallback = language.substr(0, language.lastIndexOf('-'))
  return buildChain(fallback, [...chain, fallback])
}

export default function buildLanguageFallbackChain(language) {
  return buildChain(language)
}
