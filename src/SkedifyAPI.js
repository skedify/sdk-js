import {
  applyDecorators,
  withConfig,
  withLogger,
  withDefaults,
  withExposedIncludes,
  withIdentityProvider,
  withResources,
  withNetwork,
  withSecretData,
  withResourceDomainMap,
} from './decorators'
import { withExposedAuthorization } from './decorators/withExposedAuthorization'

import * as exported from './exported'

export default class SkedifyAPI {
  constructor(config) {
    applyDecorators(
      withSecretData(),
      withNetwork(),
      withConfig(config),
      withDefaults(config),
      withLogger(),
      withIdentityProvider(),
      withResources(this),
      withExposedIncludes(),
      withResourceDomainMap(config),
      withExposedAuthorization()
    )(this)
  }
}

/**
 * Export everything that should be exported
 */
Object.defineProperties(
  SkedifyAPI,
  Object.keys(exported).reduce(
    (acc, key) =>
      Object.assign(acc, {
        [key]: {
          value: exported[key],
        },
      }),
    {}
  )
)
