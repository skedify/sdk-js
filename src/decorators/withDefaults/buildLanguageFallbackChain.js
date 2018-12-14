import buildChain from '../../util/buildChain'

export default function buildLanguageFallbackChain(language) {
  return (Array.isArray(language) ? language : [language]).reduce(
    (result, part) => [...result, ...buildChain(part, '-')],
    []
  )
}
