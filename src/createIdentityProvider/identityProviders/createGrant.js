import { createIdentityProviderError } from '../../util/createError'

import {
  MISCONFIGURED,
  MISCONFIGURED_AUTH_PROVIDER_OPTIONS,
} from '../../constants'
import { joinAsSpeech, AND } from '../../util/joinAsSpeech'
import omit from '../../util/omit'

// When the token is valid for 90 minutes, than we will re-fetch a new token 81
// minutes in instead of 89,666 minutes in which case it might be too late
// already. We will use 90% of the token duration for now.
const RE_FETCH_WINDOW = 0.9

function secondsToMilliseconds(seconds) {
  return seconds * 1000
}

function defaultAuthorizationMethod({
  network,
  reset,
  realm,
  parameters,
  grant_type,
}) {
  return (
    // Get the access_token
    network
      .post(
        `${realm}/access_tokens`,
        Object.assign({}, parameters, { grant_type })
      )
      // Setup all the required parts to authenticate
      .then(({ data }) => ({
        Authorization: `${data.token_type} ${data.access_token}`,
        Expiration: data.expires_in,
        Realm: realm,
      }))

      // Get the proxy url
      .then(auth_response => {
        // Let's not use the proxy when in node environments
        // eslint-disable-next-line better/no-typeofs
        if (typeof window === 'undefined') {
          return auth_response
        }

        const { Realm, Authorization, Expiration } = auth_response
        return network
          .get(`${Realm}/integrations/proxy`, {
            headers: { Authorization },
          })
          .then(({ data: response }) => ({
            Realm: response.data.url,
            Authorization,
            Expiration,
          }))
      })

      // Make sure to create a new access_token when the current one is going to expire
      .then(access => {
        setTimeout(
          reset,
          secondsToMilliseconds(access.Expiration * RE_FETCH_WINDOW)
        )
        return access
      })
  )
}

export function createGrant(
  grant_type,
  requiredParameters = [],
  optionalParameters = [],
  getAuthorizationMethod = defaultAuthorizationMethod
) {
  return class {
    constructor(network, parameters = {}) {
      this._network = network
      this._parameters = parameters

      // Make sure `realm` is a required option
      const allRequiredParameters = [...requiredParameters, 'realm']

      const allPossibleParameters = [
        ...allRequiredParameters,
        ...optionalParameters,
      ]

      const givenParameters = Object.keys(parameters)

      const missingRequiredParameters = allRequiredParameters.filter(
        required => !givenParameters.includes(required)
      )

      const extraMessage = `\n  - Required parameters: ${joinAsSpeech(
        AND,
        allRequiredParameters
      )}\n  - Optional parameters: ${joinAsSpeech(AND, optionalParameters) ||
        '<none>'}`

      if (missingRequiredParameters.length > 0) {
        throw createIdentityProviderError(
          `${joinAsSpeech(AND, missingRequiredParameters)} ${
            missingRequiredParameters.length === 1
              ? 'is a required parameter'
              : 'are required parameters'
          } for \`${grant_type}\`${extraMessage}`,
          MISCONFIGURED,
          MISCONFIGURED_AUTH_PROVIDER_OPTIONS
        )
      }

      const unnecessaryParameters = givenParameters.filter(
        parameter => !allPossibleParameters.includes(parameter)
      )

      if (unnecessaryParameters.length > 0) {
        throw createIdentityProviderError(
          `${joinAsSpeech(AND, unnecessaryParameters)} ${
            unnecessaryParameters.length === 1
              ? 'is not an optional or a required parameter'
              : 'are not optional or required parameters'
          } for \`${grant_type}\`${extraMessage}`,
          MISCONFIGURED,
          MISCONFIGURED_AUTH_PROVIDER_OPTIONS
        )
      }
    }

    getAuthorization(force = false) {
      const { realm } = this._parameters
      const parameters = omit(this._parameters, ['realm'])

      if (this._current === undefined || force) {
        // Ensure that the re-fetch of the token happens in a chain so that the
        // access tokens and proxy call happens first before new calls come in.
        // However, if we are using the force flag, we can't wait on the
        // previous this._current, because if that is the promise of the error
        // response, then we will have a deadlock.
        this._current = Promise.resolve(force ? undefined : this._current).then(
          () =>
            getAuthorizationMethod({
              network: this._network,
              grant_type,
              force,
              realm,
              parameters,
              reset: this.getAuthorization.bind(this, true),
            }).catch(err => {
              // Do we have some form of status code? If not, then we probably hit
              // another error.
              if (!err.response || !err.response.status) {
                throw err
              }

              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  this.getAuthorization(true).then(resolve, reject)
                }, secondsToMilliseconds(30))
              })
            })
        )
      }

      return this._current
    }
  }
}
