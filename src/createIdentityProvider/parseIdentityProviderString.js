import createError from '../util/createError'

export default function parseIdentityProviderString(idp_descriptor = '') {
  const [type, encoded_options] = idp_descriptor.split('://')

  if (type === undefined || type === '') {
    throw createError('You should provide a `type` as identity provider.')
  }

  if (encoded_options === undefined || encoded_options === '') {
    throw createError('You should provide `options` for the identity provider.')
  }

  const options = encoded_options
    .split('&')
    .map(item => item.split('='))
    .map(([key, value]) => ({
      [key]: decodeURIComponent(value),
    }))
    .reduce((a, b) => Object.assign(a, b))

  return { type, options }
}
