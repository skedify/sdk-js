export default function buildChain(
  section,
  character = '.',
  chain = [section]
) {
  if (!section.includes(character)) {
    return chain
  }

  const fallback = section.substr(0, section.lastIndexOf(character))
  return buildChain(fallback, character, [...chain, fallback])
}
