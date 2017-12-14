import filter from '../../filter'

export default class DirectIdentityProvider {
  constructor(options = {}) {
    this._authorization = filter(
      options,
      'Authorization',
      'Realm',
      'Expiration'
    )

    if (!this._authorization.Authorization) {
      throw new TypeError(
        'Authorization is a required option for DirectIdentityProvider'
      )
    }
    if (!this._authorization.Realm) {
      throw new TypeError(
        'Realm is a required option for DirectIdentityProvider'
      )
    }
    if (this._authorization.Expiration) {
      this._authorization.Expiration = Number.parseInt(
        this._authorization.Expiration,
        10
      )
    } else {
      this._authorization.Expiration = Infinity
    }
  }

  getAuthorization() {
    return Promise.resolve(this._authorization)
  }
}
