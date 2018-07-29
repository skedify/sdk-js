import retry from '../../util/retry'

import { createIdentityProviderError } from '../../util/createError'

import {
  MISCONFIGURED,
  MISCONFIGURED_REALM,
  MISCONFIGURED_AUTH_PROVIDER_OPTIONS,
} from '../../constants'
import { joinAsSpeech, AND } from '../../util/joinAsSpeech'
import omit from '../../util/omit'

const MAX_ATTEMPTS = 3
const REFETCH_WINDOW = 20

function secondsToMilliseconds(seconds) {
  return seconds * 1000
}

export function createIdentityProvider(
  grant_type,
  requiredParameters = [],
  optionalParameters = []
) {
  return class {
    constructor(network, parameters = {}) {
      this._network = network
      this._parameters = parameters

      // Check if we got a realm
      const { realm } = parameters
      if (!realm) {
        throw createIdentityProviderError(
          `realm is a required option for \`${grant_type}\``,
          MISCONFIGURED,
          MISCONFIGURED_REALM
        )
      }

      const allPossibleParameters = [
        ...requiredParameters,
        ...optionalParameters,
      ]

      const givenParameters = Object.keys(parameters).filter(
        key => key !== 'realm' // Skip the realm option, will be validated by its own
      )

      const missingRequiredParameters = requiredParameters.filter(
        required => !givenParameters.includes(required)
      )

      const extraMessage = `\n  - Required parameters: ${joinAsSpeech(
        AND,
        requiredParameters
      ) || '<none>'}\n  - Optional parameters: ${joinAsSpeech(
        AND,
        optionalParameters
      ) || '<none>'}`

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

      if (this._current === undefined || force) {
        this._current = retry(
          (resolve, reject) => {
            // Get the access_token
            this._network
              .post(
                `${realm}/access_tokens`,
                Object.assign({}, omit(this._parameters, ['realm']), {
                  grant_type,
                })
              )
              .then(resolve, reject)
          },
          {
            max_attempts: MAX_ATTEMPTS,
          }
        )
          // Setup all the required parts to authenticate
          .then(({ data }) => ({
            Authorization: `${data.token_type} ${data.access_token}`,
            Expiration: data.expires_in,
            Realm: realm,
          }))

          // Get the proxy url
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

          // Make sure to create a new access_token when the current one is going to expire
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
}
