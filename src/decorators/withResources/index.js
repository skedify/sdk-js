import * as rootResources from '../../resources'

import createResource from './createResource'
import withExternalIdentifier from './withExternalIdentifier'
import { validateIncludeAlreadyCalled, validateParentId } from './invariants'

import { HTTP_VERB_POST } from '../../constants'

export function withResources(resources = rootResources, parent = undefined) {
  return instance => {
    Object.keys(resources).forEach(name => {
      const resource = resources[name]

      /**
       * Define instance.resource(optional_identifier)
       * Define instance.resource.new(data)
       */
      Object.defineProperty(instance, name, {
        enumerable: true,
        value: Object.assign(
          identifier => {
            /**
             * If we have a parent, we are a "sub resource".
             */
            if (parent) {
              validateParentId({ parent, name, identifier })
              validateIncludeAlreadyCalled({ parent, name, identifier })
            }

            /**
             * Allow for "external://abc"
             */
            if (`${identifier}`.includes('://')) {
              return withExternalIdentifier(identifier)(
                createResource(
                  instance.__meta.identityProvider,
                  Object.assign({}, resource, {
                    name,
                  }),
                  parent
                )
              )
            }

            /**
             * Create the resource object.
             */
            return createResource(
              instance.__meta.identityProvider,
              Object.assign({}, resource, { identifier, name }),
              parent
            )
          },
          {
            new(data) {
              const newResource = createResource(
                instance.__meta.identityProvider,
                Object.assign({}, resource, {
                  data,
                  method: HTTP_VERB_POST,
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
          }
        ),
      })
    })
  }
}
