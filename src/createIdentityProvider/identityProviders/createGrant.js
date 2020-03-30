import { createIdentityProviderError } from '../../util/createError'

import {
  MISCONFIGURED,
  MISCONFIGURED_AUTH_PROVIDER_OPTIONS,
} from '../../constants'
import { joinAsSpeech, AND } from '../../util/joinAsSpeech'
import omit from '../../util/omit'
import { get } from '../../secret'

// When the token is valid for 90 minutes, than we will re-fetch a new token 81
// minutes in instead of 89,666 minutes in which case it might be too late
// already. We will use 90% of the token duration for now.
const RE_FETCH_WINDOW = 0.9

function secondsToMilliseconds(seconds) {
  return seconds * 1000
}

function defaultAuthorizationMethod({
  instance,
  reset,
  realm,
  parameters,
  grant_type,
}) {
  const { network, logger } = get(instance)

  return (
    // Get the access_token
    network
      .post(
        `${realm}/access_tokens`,
        Object.assign({}, parameters, { grant_type })
      )
      // Setup all the required parts to authenticate
      .then(({ data }) => {
        logger.info({ access: data }, 'Successfully gained access to API')

        return {
          Authorization: `${data.token_type} ${data.access_token}`,
          Expiration: data.expires_in,
          Realm: realm,
        }
      })

      // Get the proxy url
      .then((auth_response) => {
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
      .then((access) => {
        setTimeout(
          reset,
          secondsToMilliseconds(access.Expiration * RE_FETCH_WINDOW)
        )
        return access
      })
  )
}

const SKIP_RETRY_FOR_GRANTS = ['token', 'testing']

export function createGrant(
  grant_type,
  requiredParameters = [],
  optionalParameters = [],
  getAuthorizationMethod = defaultAuthorizationMethod
) {
  return class {
    constructor(instance, parameters = {}) {
      // Make sure `realm` is a required option
      const allRequiredParameters = [...requiredParameters, 'realm']

      const allPossibleParameters = [
        ...allRequiredParameters,
        ...optionalParameters,
      ]

      const givenParameters = Object.keys(parameters)

      const missingRequiredParameters = allRequiredParameters.filter(
        (required) => !givenParameters.includes(required)
      )

      const extraMessage = `\n  - Required parameters: ${joinAsSpeech(
        AND,
        allRequiredParameters
      )}\n  - Optional parameters: ${
        joinAsSpeech(AND, optionalParameters) || '<none>'
      }`

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
        (parameter) => !allPossibleParameters.includes(parameter)
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

      const { logger } = get(instance)

      this._instance = instance
      this._logger = logger
      this._parameters = parameters
    }

    getAuthorization(force = false, tries = 2) {
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
              instance: this._instance,
              grant_type,
              force,
              realm,
              parameters,
              reset: this.getAuthorization.bind(this, true),
            })
        )
      }

      return this._current.catch((err) => {
        // Handle unauthorized response
        if (err.response && err.response.status === 401) {
          if (SKIP_RETRY_FOR_GRANTS.includes(grant_type)) {
            throw err
          }

          // Check if we can retry to recover from a 401. It might be that your
          // access token has expired and that we can create a new one using the
          // given credentials. If your credentials are wrong a 401 will be
          // returned as well. We can try to retry it for a few times if
          // something funky is going on in the backend but after that we should
          // just abort altogether.
          if (tries <= 0) {
            throw err
          }

          // Let's retry to recover from 401!
          return this.getAuthorization(true, tries - 1)
        }

        return new Promise((resolve, reject) => {
          this._logger.error({ err }, 'Got error, will retry soon')
          setTimeout(() => {
            this._logger.trace({}, 'Re-trying to acquire a connection')
            this.getAuthorization(true).then(resolve, reject)
          }, secondsToMilliseconds(30))
        })
      })
    }
  }
}
