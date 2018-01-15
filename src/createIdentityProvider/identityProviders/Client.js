import retry from '../../util/retry'

import { createIdentityProviderError } from '../../util/createError'

import {
  MISCONFIGURED,
  MISCONFIGURED_CLIENT_ID,
  MISCONFIGURED_REALM,
} from '../../constants'

const MAX_ATTEMPTS = 3
const REFETCH_WINDOW = 20

function secondsToMilliseconds(seconds) {
  return seconds * 1000
}

export default class Client {
  constructor(network, { client_id, realm } = {}) {
    this._options = { client_id, realm }
    this._network = network

    if (!client_id) {
      throw createIdentityProviderError(
        'client_id is a required option for `Client`',
        MISCONFIGURED,
        MISCONFIGURED_CLIENT_ID
      )
    }

    if (!realm) {
      throw createIdentityProviderError(
        'realm is a required option for `Client`',
        MISCONFIGURED,
        MISCONFIGURED_REALM
      )
    }
  }

  getAuthorization(force = false) {
    const { client_id, realm } = this._options

    if (this._current === undefined || force) {
      this._current = retry(
        (resolve, reject) => {
          this._network
            .post(`${realm}/access_tokens`, {
              grant_type: 'public_client',
              client_id: client_id,
            })
            .then(resolve, reject)
        },
        {
          max_attempts: MAX_ATTEMPTS,
        }
      )
        .then(({ data }) => ({
          Authorization: `${data.token_type} ${data.access_token}`,
          Expiration: data.expires_in,
          Realm: realm,
        }))
        .then(({ Realm, Authorization, Expiration }) =>
          this._network
            .get(`${Realm}/integrations/proxy`, {
              headers: { Authorization },
            })
            .then(({ data: response }) => ({
              Realm: response.data.url,
              Authorization,
              Expiration,
            }))
        )
        .then(access => {
          setTimeout(
            this.getAuthorization.bind(this, true),
            secondsToMilliseconds(access.Expiration - REFETCH_WINDOW)
          )
          return access
        })
    }

    return this._current
  }
}
