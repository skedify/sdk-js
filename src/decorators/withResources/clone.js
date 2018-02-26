import { get, set } from '../../secret'

export default function clone(resource) {
  const { instance, descriptor, parent, requestConfig } = get(resource)

  const cloned = new resource.constructor(instance, descriptor, parent)

  set(cloned, ({ requestConfig: originalRequestConfig }) => ({
    requestConfig: Object.assign({}, originalRequestConfig, requestConfig),
  }))

  return cloned
}
