import createResource from './createResource'
import { validateResponseFromExternalIdentifier } from './invariants'

export default function createResourceUsingExternalIdentifier({
  identifier,
  instance,
  resource,
  name,
  parent,
}) {
  const [externalIdentifierType, externalIdentifierValue] = identifier.split(
    '://'
  )

  /**
   * Create the resource object and immediately start filtering.
   */
  return createResource(
    instance.__meta.identityProvider,
    Object.assign({}, resource, {
      identifier: undefined,
      name,
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
      validateResponseFromExternalIdentifier({ response })

      /**
       * Return the first result
       */
      return Object.assign({}, response, {
        data: response.data[0],
      })
    })
}
