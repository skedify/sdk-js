import filter from '../../filter'
import request from '../request'
import retry from '../../retry'

const MAX_ATTEMPTS = 3
const REFETCH_WINDOW = 20
const S_TO_MS = 1000

export default class ClientIdentityProvider {
  constructor(options = {}) {
    this._options = filter(options, 'Client', 'Realm')

    if (!this._options.Client) {
      throw new TypeError(
        'Client is a required option for ClientIdentityProvider'
      )
    }
    if (!this._options.Realm) {
      throw new TypeError(
        'Realm is a required option for ClientIdentityProvider'
      )
    }
  }

  getAuthorization(force = false) {
    if (this._current === undefined || force) {
      this._current = retry(
        (resolve, reject) => {
          request(
            `${this._options.Realm}/access_tokens`,
            {
              grant_type: 'public_client',
              client_id: this._options.Client,
            },
            {
              method: 'POST',
            }
          ).then(resolve, reject)
        },
        {
          max_attempts: MAX_ATTEMPTS,
        }
      )
        .then(access_token_response => ({
          Authorization: `${access_token_response.body.token_type} ${
            access_token_response.body.access_token
          }`,
          Expiration: access_token_response.body.expires_in,
          Realm: this._options.Realm,
        }))
        .then(access => {
          setTimeout(
            this.getAuthorization.bind(this, true),
            (access.Expiration - REFETCH_WINDOW) * S_TO_MS
          )
          return access
        })
    }
    return this._current
  }
}
