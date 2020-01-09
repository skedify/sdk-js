import { get } from '../../secret'
import createCallConfig from './createCallConfig'
import retry from '../../util/retry'

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
  const { instance, descriptor, resource_path, parent } = get(resourceEntity)
  const { identityProvider, resource_domain_map, default_headers } = get(
    instance
  )

  const callConfig = createCallConfig(resourceEntity, {
    url: createURL(
      resource_domain_map[resource_path] !== undefined
        ? resource_domain_map[resource_path].url
        : Realm,
      createParentURL(parent),
      descriptor.resource,
      descriptor.identifier
    ),
    headers: {
      ...(resource_domain_map[resource_path] !== undefined
        ? resource_domain_map[resource_path].headers
        : default_headers),
      Authorization,
    },
  })

  function tryToRecoverFromErrors(err) {
    if (err && err.response && err.response.status === 401) {
      return identityProvider
        .getAuthorization(true)
        .then(createRequest.bind(null, resourceEntity))
    }

    throw err
  }

  return callConfig.method === 'get'
    ? retry((resolve, reject) => {
        get(instance)
          .network(callConfig)
          .catch(tryToRecoverFromErrors)
          .then(resolve, reject)
      })
    : get(instance)
        .network(callConfig)
        .catch(tryToRecoverFromErrors)
}
