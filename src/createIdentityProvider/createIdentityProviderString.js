function encodeParams(options = {}) {
  return Object.keys(options)
    .map(key => `${key}=${encodeURIComponent(options[key])}`)
    .join('&')
}

export default function createIdentityProviderString(type, options) {
  return `${type}://${encodeParams(options)}`
}
