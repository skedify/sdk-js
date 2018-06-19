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
  const { instance, descriptor, parent } = get(resourceEntity)
  const callConfig = createCallConfig(resourceEntity, {
    url: createURL(
      Realm,
      createParentURL(parent),
      descriptor.resource,
      descriptor.identifier
    ),
    headers: {
      Authorization,
    },
  })

  return callConfig.method === 'get'
    ? retry((resolve, reject) => {
        get(instance)
          .network(callConfig)
          .then(resolve, reject)
      })
    : get(instance).network(callConfig)
}
