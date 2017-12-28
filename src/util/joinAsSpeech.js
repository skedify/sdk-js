export function joinAsSpeech(separator, list = []) {
  if (list.length <= 1) {
    return list[0]
  }

  const rest = list.slice()
  const last = rest.pop()

  return [rest.join(', '), last].join(separator)
}

export const AND = ' and '
export const OR = ' or '

export default joinAsSpeech
