import { createIdentityProviderError } from '../../util/createError'

import {
  MISCONFIGURED,
  MISCONFIGURED_TOKEN_TYPE,
  MISCONFIGURED_ACCESS_TOKEN,
  MISCONFIGURED_REALM,
} from '../../constants'

export default class Token {
  constructor(network, { token_type, access_token, realm } = {}) {
    this._options = { token_type, access_token, realm }
    this._network = network

    if (!token_type) {
      throw createIdentityProviderError(
        'token_type is a required option for `Token`',
        MISCONFIGURED,
        MISCONFIGURED_TOKEN_TYPE
      )
    }

    if (!access_token) {
      throw createIdentityProviderError(
        'access_token is a required option for `Token`',
        MISCONFIGURED,
        MISCONFIGURED_ACCESS_TOKEN
      )
    }

    if (!realm) {
      throw createIdentityProviderError(
        'realm is a required option for `Token`',
        MISCONFIGURED,
        MISCONFIGURED_REALM
      )
    }
  }

  getAuthorization() {
    const { token_type, access_token, realm } = this._options

    if (this._current === undefined) {
      const Authorization = `${token_type} ${access_token}`

      this._current = this._network
        .get(`${realm}/integrations/proxy`, {
          headers: { Authorization },
        })
        .then(({ data: response }) => ({
          Realm: response.data.url,
          Authorization,
        }))
    }

    return this._current
  }
}
