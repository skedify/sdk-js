import { get } from '../../secret'
import createCallConfig from './createCallConfig'
import retry from '../../util/retry'
import { HTTP_VERB_DELETE } from '../../constants'

function createURL(...parts) {
  return parts.filter(Boolean).join('/')
}

function createParentURL(parent) {
  if (parent === undefined) {
    return undefined
  }

  const { parent: grandParent, descriptor } = get(parent)

  return createURL(
    createParentURL(grandParent),
    descriptor.resource,
    descriptor.identifier && encodeURIComponent(descriptor.identifier)
  )
}

export default function createRequest(
  resourceEntity,
  { Realm, Authorization }
) {
  const { instance, descriptor, resource_path, parent, requestConfig } = get(
    resourceEntity
  )
  const { identityProvider, resource_domain_map } = get(instance)

  const callConfig = createCallConfig(resourceEntity, {
    url: createURL(
      resource_domain_map[resource_path] !== undefined
        ? resource_domain_map[resource_path].url
        : Realm,
      createParentURL(parent),
      descriptor.resource,

      requestConfig.method === HTTP_VERB_DELETE &&
        Array.isArray(descriptor.identifier)
        ? undefined // We can omit the identifier when it is a DELETE of multiple resources
        : descriptor.identifier
    ),

    // Convert the list of id's to the data body when it is a delete
    ...(requestConfig.method === HTTP_VERB_DELETE &&
    Array.isArray(descriptor.identifier)
      ? { data: descriptor.identifier }
      : {}),

    headers: {
      ...(resource_domain_map[resource_path] !== undefined
        ? resource_domain_map[resource_path].headers
        : {}),
      Authorization,
    },
  })

  function tryToRecoverFromErrors(err) {
    // Try to recover from 401 by refreshing the token.
    if (err && err.response && err.response.status === 401) {
      return identityProvider
        .getAuthorization(true)
        .then(createRequest.bind(null, resourceEntity))
    }

    // Forward the error if it is not recoverable
    throw err
  }

  return callConfig.method === 'get'
    ? retry((resolve, reject) => {
        get(instance)
          .network(callConfig)
          .catch(tryToRecoverFromErrors)
          .then(resolve, reject)
      })
    : get(instance).network(callConfig).catch(tryToRecoverFromErrors)
}
