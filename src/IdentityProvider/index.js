import Direct from './Direct'
import Client from './Client'

const IDPS = {
  direct: Direct,
  client: Client,
}

export default function createIdentityProvider(idp_descriptor) {
  const [type, encoded_options] = idp_descriptor.split('://')
  const options = encoded_options
    .split('&')
    .map(item => item.split('='))
    .map(([key, value]) => ({
      [key]: decodeURIComponent(value),
    }))
    .reduce((a, b) => Object.assign(a, b))

  return new IDPS[type](options)
}
