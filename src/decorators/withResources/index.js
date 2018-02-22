import * as rootResources from '../../resources'

import withExternalIdentifier from './withExternalIdentifier'
import { validateIncludeAlreadyCalled, validateParentId } from './invariants'
import Resource from './Resource'

export function withResources(
  instance,
  resources = rootResources,
  parent = undefined
) {
  return target => {
    Object.keys(resources).forEach(name => {
      const resource = resources[name]

      /**
       * Define instance.resource(optional_identifier)
       */
      Object.defineProperty(target, name, {
        enumerable: true,
        value: Object.assign(identifier => {
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
            const nextResource = new Resource(
              instance,
              Object.assign({ name }, resource),
              parent
            )

            return withExternalIdentifier(identifier)(nextResource)
          }

          /**
           * Create the resource object.
           */
          return new Resource(
            instance,
            Object.assign({ identifier, name }, resource),
            parent
          )
        }),
      })
    })
  }
}
