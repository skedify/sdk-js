import * as rootResources from '../../resources'

import createResource from './createResource'
import {
  validateIncludeAlreadyCalled,
  validateInvalidParentId,
  validateMultipleResultsFound,
  validateNoResultsFound,
} from './invariants'

export function withResources(resources = rootResources, parent = undefined) {
  return instance => {
    Object.keys(resources).forEach(key => {
      const resource = resources[key]

      function value(identifier) {
        /**
         * If we have a parent, we are a "sub resource".
         */
        if (parent) {
          validateInvalidParentId({ parent, key, identifier })
          validateIncludeAlreadyCalled({ parent, key, identifier })
        }

        /**
         * Allow for "external://abc"
         */
        if (`${identifier}`.includes('://')) {
          const [
            externalIdentifierType,
            externalIdentifierValue,
          ] = identifier.split('://')

          /**
           * Create the resource object and immediately start filtering.
           */
          return (
            createResource(
              instance.__meta.identityProvider,
              Object.assign({}, resource, {
                identifier: undefined,
                name: key,
              }),
              parent
            )
              .filter(item =>
                item[
                  {
                    external: 'external_id',
                  }[externalIdentifierType]
                ](externalIdentifierValue)
              )
              // eslint-disable-next-line consistent-return
              .addResponseInterceptor(response => {
                /**
                 * Return the first result if there is only 1 result
                 */
                if (response.data && response.data.length === 1) {
                  return Object.assign({}, response, {
                    data: response.data[0],
                  })
                }

                validateMultipleResultsFound({ response })
                validateNoResultsFound({ response })
              })
          )
        }

        /**
         * Create the resource object.
         */
        return createResource(
          instance.__meta.identityProvider,
          Object.assign({}, resource, { identifier, name: key }),
          parent
        )
      }

      /**
       * Define instance.resource()
       * Define instance.resource.new()
       */
      Object.defineProperty(instance, key, {
        enumerable: true,
        configurable: false,
        writable: false,
        value: Object.assign(value, {
          new(data) {
            const newResource = createResource(
              instance.__meta.identityProvider,
              Object.assign({}, resource, {
                identifier: undefined,
                data,
                method: 'post',
                name: 'new',
              }),
              parent
            )

            const originalThen = newResource.then

            newResource.then = function then(resolve) {
              // TODO: Reject when validation fails

              return resolve({
                create: () => new Promise(originalThen),
              })
            }

            return newResource
          },
        }),
      })
    })
  }
}
