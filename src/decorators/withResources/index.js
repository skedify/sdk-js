import * as rootResources from '../../resources'

import createError from '../../util/createError'

import {
  ERROR_RESOURCE,
  ERROR_SUBRESOURCE_INVALID_PARENT_ID,
  ERROR_SUBRESOURCE_INCLUDE_ALREADY_CALLED,
  ERROR_RESPONSE,
  ERROR_RESPONSE_NO_RESULTS_FOUND,
  ERROR_RESPONSE_MULTIPLE_RESULTS_FOUND,
} from '../../constants'

import createResource from './createResource'

export function withResources(resources = rootResources, parent = undefined) {
  return instance => {
    Object.keys(resources).forEach(key => {
      const resource = resources[key]

      function value(identifier) {
        /**
         * If we have a parent, we are a "sub resource".
         */
        if (parent) {
          /**
           * Error when trying to use subresources but the parent has no `id`.
           */
          if (parent.__meta.identifier === undefined) {
            throw createError(
              `You tried to call \`.${
                parent.__meta.name
              }(/* MISSING IDENTIFIER */).${key}(${
                identifier === undefined ? '' : JSON.stringify(identifier)
              })\` but the parent id is missing.`,
              ERROR_RESOURCE,
              ERROR_SUBRESOURCE_INVALID_PARENT_ID
            )
          }

          /**
           * Error when parent has includes defined already.
           */
          if (
            Array.isArray(parent.__meta.__data.include) &&
            parent.__meta.__data.include.length > 0
          ) {
            throw createError(
              `You tried to call \`.${key}(${
                identifier === undefined ? '' : JSON.stringify(identifier)
              })\` as a sub resource on \`.${
                parent.__meta.name
              }(${JSON.stringify(
                parent.__meta.identifier
              )})\`, but \`.include(${parent.__meta.__data.include
                .map(item => `"${item}"`)
                .join(
                  ', '
                )})\` was already called and you can not call \`.include()\` before calling a sub resource.`,
              ERROR_RESOURCE,
              ERROR_SUBRESOURCE_INCLUDE_ALREADY_CALLED
            )
          }
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
          return createResource(
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
            .addResponseInterceptor(response => {
              /**
               * Return the first result if there is only 1 result
               */
              if (response.data && response.data.length === 1) {
                return Object.assign({}, response, {
                  data: response.data[0],
                })
              }

              /**
               * Only 1 value is allowed
               */
              if (response.data && response.data.length > 1) {
                throw Object.assign(
                  createError(
                    'Multiple results found',
                    ERROR_RESPONSE,
                    ERROR_RESPONSE_MULTIPLE_RESULTS_FOUND
                  ),
                  { response, alternatives: response.data }
                )
              }

              /**
               * No results found
               */
              throw Object.assign(
                createError(
                  'No results found',
                  ERROR_RESPONSE,
                  ERROR_RESPONSE_NO_RESULTS_FOUND
                ),
                { response }
              )
            })
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
