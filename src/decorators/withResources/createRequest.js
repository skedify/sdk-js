import { get } from '../../secret'
import createCallConfig from './createCallConfig'

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

  return get(instance).network(
    createCallConfig(resourceEntity, {
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
  )
}
