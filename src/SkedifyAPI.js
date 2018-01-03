import {
  applyDecorators,
  withConfig,
  withDefaults,
  withExposedIncludes,
  withIdentityProvider,
  withResources,
  withShorthands,
} from './decorators'

import * as exported from './exported'

export default class SkedifyAPI {
  constructor(config) {
    applyDecorators(
      withConfig(config),
      withDefaults(),
      withIdentityProvider(),
      withResources(),
      withShorthands(),
      withExposedIncludes()
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
