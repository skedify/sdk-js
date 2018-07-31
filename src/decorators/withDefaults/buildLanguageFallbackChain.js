function buildChain(language, chain = [language]) {
  if (!language.includes('-')) {
    return chain
  }

  const fallback = language.substr(0, language.lastIndexOf('-'))
  return buildChain(fallback, [...chain, fallback])
}

export default function buildLanguageFallbackChain(language) {
  return (Array.isArray(language) ? language : [language]).reduce(
    (result, part) => [...result, ...buildChain(part)],
    []
  )
}
