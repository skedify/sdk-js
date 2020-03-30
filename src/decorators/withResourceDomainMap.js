import { get } from '../secret'

export function withResourceDomainMap(config) {
  const { resource_domain_map = {} } = config

  return (instance) => {
    get(instance).resource_domain_map = resource_domain_map
  }
}
