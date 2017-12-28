import * as rootResources from '../../resources'

import createError from '../../util/createError'

import {
  ERROR_RESOURCE,
  ERROR_SUBRESOURCE_INVALID_PARENT_ID,
  ERROR_SUBRESOURCE_INCLUDE_ALREADY_CALLED,
} from '../../constants'

import createResource from './createResource'

export function withResources(resources = rootResources, parent = undefined) {
  return instance => {
    Object.keys(resources).forEach(key => {
      const resource = resources[key]

      Object.defineProperty(instance, key, {
        enumerable: true,
        configurable: false,
        writable: false,
        value(identifier) {
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
                  parent.__meta.method
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
                  parent.__meta.method
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
            const [type, value] = identifier.split('://')

            /**
             * Create the resource object and immediately start filtering.
             */
            return createResource(
              instance.__meta.identityProvider,
              Object.assign({}, resource, {
                identifier: undefined,
                method: key,
              }),
              parent
            ).filter(item =>
              item[
                {
                  external: 'external_id',
                }[type]
              ](value)
            )
          }

          /**
           * Create the resource object.
           */
          return createResource(
            instance.__meta.identityProvider,
            Object.assign({}, resource, { identifier, method: key }),
            parent
          )
        },
      })
    })
  }
}
